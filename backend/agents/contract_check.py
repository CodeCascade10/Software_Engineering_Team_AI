"""Best-effort static endpoint extraction for the generated Python/JS projects."""
import ast
import posixpath
import re
from urllib.parse import urlsplit

from agents.schemas import ValidationResult


HTTP_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"}


def _canonical_path(path):
    path = re.sub(r"\$\{[^}]+\}", "{}", path)
    path = re.sub(r"\{[^}]+\}|:[A-Za-z_][A-Za-z0-9_]*", "{}", path)
    path = re.sub(r"\?.*$", "", path)
    return "/" + "/".join(part for part in path.split("/") if part)


def _join_path(*parts):
    return _canonical_path("/".join(str(part or "").strip("/") for part in parts))


def _py_module_path(source_file, module, file_names):
    relative = module.replace(".", "/")
    candidates = [relative + ".py", relative + "/__init__.py"]
    base = posixpath.dirname(source_file)
    for candidate in candidates:
        resolved = posixpath.normpath(posixpath.join(base, candidate))
        if resolved in file_names:
            return resolved
    for candidate in candidates:
        if candidate in file_names:
            return candidate
    return None


def _python_routes(files):
    file_names = {item["file_name"] for item in files}
    modules = {}
    routes_by_file = {}
    for item in files:
        name = item["file_name"]
        if not name.endswith(".py"):
            continue
        try:
            tree = ast.parse(item["content"])
        except SyntaxError:
            continue
        router_prefix = {}
        imports = {}
        route_defs = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module:
                for alias in node.names:
                    imports[alias.asname or alias.name] = (_py_module_path(name, node.module, file_names), alias.name)
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    imports[alias.asname or alias.name.split(".")[-1]] = (_py_module_path(name, alias.name, file_names), None)
            elif isinstance(node, (ast.Assign, ast.AnnAssign)):
                targets = node.targets if isinstance(node, ast.Assign) else [node.target]
                value = node.value
                if isinstance(value, ast.Call) and isinstance(value.func, ast.Name) and value.func.id in {"APIRouter", "FastAPI"}:
                    prefix = next((kw.value.value for kw in value.keywords if kw.arg == "prefix" and isinstance(kw.value, ast.Constant) and isinstance(kw.value.value, str)), "")
                    for target in targets:
                        if isinstance(target, ast.Name):
                            router_prefix[target.id] = prefix
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for decorator in node.decorator_list:
                    if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute):
                        method = decorator.func.attr.upper()
                        if method in HTTP_METHODS and decorator.args and isinstance(decorator.args[0], ast.Constant) and isinstance(decorator.args[0].value, str):
                            var = decorator.func.value.id if isinstance(decorator.func.value, ast.Name) else "app"
                            route_defs.append((var, method, _join_path(router_prefix.get(var, ""), decorator.args[0].value)))
        include_calls = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "include_router" and node.args and isinstance(node.args[0], ast.Name):
                var = node.args[0].id
                prefix = next((kw.value.value for kw in node.keywords if kw.arg == "prefix" and isinstance(kw.value, ast.Constant) and isinstance(kw.value.value, str)), "")
                include_calls.append((var, prefix))
        modules[name] = {"imports": imports, "routes": route_defs, "includes": include_calls}
        routes_by_file[name] = route_defs

    all_routes = set()
    for name, module in modules.items():
        for var, method, path in module["routes"]:
            if var.lower() in {"app", "application"} or var not in module["imports"]:
                if var.lower() in {"app", "application"}:
                    all_routes.add((method, path))
        for var, mount_prefix in module["includes"]:
            target, symbol = module["imports"].get(var, (None, None))
            if target and target in modules:
                for route_var, method, path in modules[target]["routes"]:
                    if symbol is None or route_var == symbol:
                        all_routes.add((method, _join_path(mount_prefix, path)))
    return all_routes


def _js_tokens(source):
    """Tokenize enough JavaScript to distinguish calls from comments/string text."""
    tokens, i, length = [], 0, len(source)
    while i < length:
        char = source[i]
        if char.isspace():
            i += 1
            continue
        if source.startswith("//", i):
            end = source.find("\n", i + 2)
            i = length if end < 0 else end + 1
            continue
        if source.startswith("/*", i):
            end = source.find("*/", i + 2)
            i = length if end < 0 else end + 2
            continue
        if char in "'\"`":
            quote, start = char, i
            i += 1
            value = []
            while i < length:
                if source[i] == "\\" and i + 1 < length:
                    value.extend((source[i], source[i + 1]))
                    i += 2
                elif source[i] == quote:
                    i += 1
                    break
                else:
                    value.append(source[i])
                    i += 1
            tokens.append(("string" if quote != "`" else "template", "".join(value), start))
            continue
        if char.isalpha() or char in "_$":
            start = i
            i += 1
            while i < length and (source[i].isalnum() or source[i] in "_$"):
                i += 1
            tokens.append(("id", source[start:i], start))
            continue
        tokens.append(("punct", char, i))
        i += 1
    return tokens


def _js_literal_path(token_value, token_kind):
    value = token_value
    if token_kind == "template":
        value = re.sub(r"\$\{[^}]+\}", "{}", value)
        value = re.sub(r"^\{\}/", "", value)
    if value.startswith(("http://", "https://")):
        value = urlsplit(value).path
    return value


def _js_imports(tokens):
    imports = {}
    for i, token in enumerate(tokens):
        if token[:2] == ("id", "require") and i + 2 < len(tokens) and tokens[i + 1][1] == "(":
            if tokens[i + 2][0] == "string":
                module = tokens[i + 2][1]
                if i >= 2 and tokens[i - 1][1] == "=" and tokens[i - 2][0] == "id":
                    imports[tokens[i - 2][1]] = module
        if token[:2] == ("id", "from") and i + 1 < len(tokens) and tokens[i + 1][0] == "string":
            module = tokens[i + 1][1]
            before = tokens[max(0, i - 8):i]
            ids = [value for kind, value, _ in before if kind == "id"]
            if ids:
                imports[ids[-1]] = module
    return imports


def _resolve_module(source_file, module, file_names):
    if not module.startswith("."):
        module = "./" + module
    base = posixpath.dirname(source_file)
    stem = posixpath.normpath(posixpath.join(base, module))
    for candidate in (stem + ".js", stem + ".jsx", posixpath.join(stem, "index.js"), stem):
        if candidate in file_names:
            return candidate
    return None


def _express_routes(files):
    token_maps = {item["file_name"]: _js_tokens(item["content"]) for item in files if item["file_name"].endswith(".js")}
    file_names = set(token_maps)
    module_imports = {name: _js_imports(tokens) for name, tokens in token_maps.items()}
    routes = {name: [] for name in token_maps}
    mounts = {name: [] for name in token_maps}
    for name, tokens in token_maps.items():
        for i in range(len(tokens) - 4):
            if tokens[i][0] != "id" or tokens[i + 1][1] != "." or tokens[i + 3][1] != "(":
                continue
            receiver, method = tokens[i][1], tokens[i + 2][1].lower()
            if method in {item.lower() for item in HTTP_METHODS} and tokens[i + 4][0] in {"string", "template"}:
                path = _js_literal_path(tokens[i + 4][1], tokens[i + 4][0])
                routes[name].append((receiver, method.upper(), _canonical_path(path)))
            if method == "use" and tokens[i + 4][0] in {"string", "template"}:
                prefix = _js_literal_path(tokens[i + 4][1], tokens[i + 4][0])
                comma = i + 5
                while comma < len(tokens) and tokens[comma][1] not in {",", ")"}:
                    comma += 1
                if comma + 1 < len(tokens) and tokens[comma + 1][0] == "id":
                    mounts[name].append((tokens[comma + 1][1], prefix))
    all_routes = set()
    mounted_modules = set()
    resolved_mounts = []
    for name, items in mounts.items():
        for receiver, prefix in items:
            target = _resolve_module(name, module_imports[name].get(receiver, ""), file_names)
            if target:
                mounted_modules.add(target)
                resolved_mounts.append((target, prefix))
    for name, items in routes.items():
        all_routes.update((method, path) for receiver, method, path in items if receiver in {"app", "server"})
        if name not in mounted_modules:
            all_routes.update((method, path) for receiver, method, path in items if receiver not in {"app", "server"})
    for target, prefix in resolved_mounts:
        for route_receiver, method, path in routes[target]:
            if route_receiver not in {"app", "server"}:
                all_routes.add((method, _join_path(prefix, path)))
    return all_routes


def extract_backend_routes(files, stack):
    if stack == "FastAPI":
        return _python_routes(files)
    if stack == "MERN":
        return _express_routes(files)
    return set()


def _frontend_call_args(tokens, i):
    """Return (method, path, resolvable), consuming static string/template/concat args."""
    open_index = i + 3
    if open_index >= len(tokens) or tokens[open_index][1] != "(":
        return None
    first = open_index + 1
    if first >= len(tokens):
        return None
    method = tokens[i + 2][1].upper()
    pieces, j, saw_static = [], first, False
    if tokens[j][0] in {"string", "template"}:
        pieces.append(_js_literal_path(tokens[j][1], tokens[j][0])); saw_static = True; j += 1
    elif tokens[j][0] == "id":
        pieces.append("{}"); j += 1
    while j + 1 < len(tokens) and tokens[j][1] == "+":
        j += 1
        if tokens[j][0] in {"string", "template"}:
            pieces.append(_js_literal_path(tokens[j][1], tokens[j][0])); saw_static = True
        elif tokens[j][0] == "id":
            pieces.append("{}")
        else:
            break
        j += 1
    raw = "".join(pieces)
    resolvable = saw_static and "/" in raw
    if raw.startswith("{}"):
        raw = raw[2:]
    if raw and not raw.startswith("/") and not raw.startswith("http"):
        raw = "/" + raw
    return method, _canonical_path(raw), resolvable


def extract_frontend_calls(files):
    calls, warnings = set(), []
    for item in files:
        name = item["file_name"]
        if not name.endswith((".js", ".jsx", ".ts", ".tsx")):
            continue
        tokens = _js_tokens(item["content"])
        constants = {}
        for j in range(len(tokens) - 3):
            if tokens[j][0] == "id" and tokens[j + 1][1] == "=" and tokens[j + 2][0] in {"string", "template"}:
                constants[tokens[j][1]] = _js_literal_path(tokens[j + 2][1], tokens[j + 2][0])
        base_urls = {}
        for j in range(len(tokens) - 5):
            if tokens[j][0] == "id" and tokens[j + 1][1] == "=" and tokens[j + 2][:2] == ("id", "axios") and tokens[j + 3][1:2] == (".",) and tokens[j + 4][:2] == ("id", "create"):
                end = next((k for k in range(j + 5, min(len(tokens), j + 40)) if tokens[k][1] == ")"), min(len(tokens) - 1, j + 5))
                for k in range(j + 5, end - 2):
                    if tokens[k][:2] == ("id", "baseURL") and tokens[k + 1][1] == ":":
                        value = tokens[k + 2]
                        if value[0] in {"string", "template"}:
                            base_urls[tokens[j][1]] = _js_literal_path(value[1], value[0])
                        elif value[0] == "id" and value[1] in constants:
                            base_urls[tokens[j][1]] = constants[value[1]]
        for i in range(len(tokens) - 3):
            method = None
            if tokens[i][0] == "id" and tokens[i + 1][1] == "." and tokens[i + 2][0] == "id" and tokens[i + 2][1].lower() in {m.lower() for m in HTTP_METHODS} and tokens[i + 3][1] == "(":
                method = tokens[i + 2][1].upper()
                # Accept calls on axios, an instance created by axios.create, or named API clients.
                receiver = tokens[i][1]
                if receiver not in {"axios", "api", "client"}:
                    continue
                call = _frontend_call_args(tokens, i)
                if call:
                    call_method, call_path, resolvable = call
                    base = base_urls.get(receiver)
                    if base and call_path != "/":
                        call_path = _join_path(urlsplit(base).path if base.startswith("http") else base, call_path)
                    calls.add((call_method, call_path, resolvable, name))
            elif tokens[i][:2] == ("id", "fetch") and tokens[i + 1][1] == "(":
                first = i + 2
                if first < len(tokens):
                    method = "GET"
                    # Read a literal method in fetch options when present.
                    segment = tokens[first + 1:first + 24]
                    for j in range(len(segment) - 2):
                        if segment[j][1] == "method" and segment[j + 1][1] == ":" and segment[j + 2][0] == "string":
                            method = segment[j + 2][1].upper(); break
                    if tokens[first][0] in {"string", "template"}:
                        value = _js_literal_path(tokens[first][1], tokens[first][0])
                        calls.add((method, _canonical_path(value), "/" in value, name))
                    else:
                        calls.add((method, "/{}", False, name))
    return calls, warnings


def check_api_contract(contract, backend_files, frontend_files, stack) -> ValidationResult:
    result = ValidationResult()
    expected = {(str(item["method"]).upper(), _canonical_path(item["path"])) for item in contract}
    backend = extract_backend_routes(backend_files, stack)
    frontend, warnings = extract_frontend_calls(frontend_files)
    for method, path in sorted(expected):
        present = (method, path) in backend
        result.add(f"contract_backend:{method}:{path}", present, "Contract endpoint exists in backend" if present else f"Backend is missing contract endpoint {method} {path}")
    for method, path in sorted(backend - expected):
        result.add(f"backend_extra:{method}:{path}", False, f"Backend route is absent from API contract: {method} {path}")
    for method, path, resolvable, source_file in sorted(frontend):
        if not resolvable:
            result.add(f"frontend_dynamic:{method}:{path}", False, f"Unresolvable dynamic URL in file {source_file}", severity="low", details={"file": source_file}, mandatory=False)
        elif (method, path) in expected:
            result.add(f"frontend_contract:{method}:{path}", True, "Frontend call matches API contract", severity="info")
        else:
            path_methods = {expected_method for expected_method, expected_path in expected if expected_path == path}
            if path_methods:
                result.add(f"frontend_method:{method}:{path}", False, f"Frontend uses {method} for {path}; contract requires {', '.join(sorted(path_methods))}")
            else:
                result.add(f"frontend_extra:{method}:{path}", False, f"Frontend calls endpoint absent from API contract: {method} {path}")
    for name, snippet in warnings:
        result.add(f"frontend_dynamic:{name}", False, f"Unresolvable dynamic URL in file {name}: {snippet}", severity="low", details={"file": name}, mandatory=False)
    if not contract:
        result.add("contract_nonempty", False, "API contract is empty")
    return result
