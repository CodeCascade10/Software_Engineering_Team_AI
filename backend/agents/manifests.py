import ast
import json
import re
from pathlib import PurePosixPath

from agents.schemas import ValidationResult


SUPPORTED_BACKEND_STACKS = ("FastAPI", "MERN")
FRONTEND_STACK = "React/Vite"
BACKEND_MANIFESTS = {
    "FastAPI": ("main.py", "routes/auth.py", "database.py", "models.py", "requirements.txt", ".env.example"),
    "MERN": ("server.js", "routes/auth.js", "models/User.js", "package.json", ".env.example"),
}
FRONTEND_MANIFEST = (
    "index.html", "App.jsx", "src/main.jsx", "src/services/api.js", "src/pages/Home.jsx", "package.json"
)
PY_REQUIREMENT = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]*(\[[A-Za-z0-9_,.-]+\])?(\s*(===|==|~=|!=|<=|>=|<|>)\s*[A-Za-z0-9.*+!-]+)?(\s*;\s*[^\s].*)?$")


def _file_map(files):
    return {PurePosixPath(item["file_name"]).as_posix(): item.get("content", "") for item in files}


def _check_python(files, result):
    for name, content in files.items():
        if name.endswith(".py"):
            try:
                ast.parse(content, filename=name)
            except SyntaxError as exc:
                result.add(
                    f"python_syntax:{name}", False,
                    f"Python syntax error at line {exc.lineno}: {exc.msg}",
                    details={"file": name, "line": exc.lineno},
                )
            else:
                result.add(f"python_syntax:{name}", True, "Python syntax is valid", severity="info")


def _check_package(files, result, *, frontend):
    package_text = files.get("package.json")
    if package_text is None:
        return
    try:
        package = json.loads(package_text)
    except (TypeError, json.JSONDecodeError) as exc:
        result.add("package_json", False, f"package.json is invalid JSON: {exc}", details={"file": "package.json"})
        return
    valid = isinstance(package, dict) and isinstance(package.get("name"), str) and bool(package["name"].strip())
    valid = valid and isinstance(package.get("scripts"), dict) and isinstance(package.get("dependencies"), dict)
    result.add("package_json_shape", valid, "package.json has name, scripts, and dependencies" if valid else "package.json requires name, scripts, and dependencies", details={"file": "package.json"})
    if not valid:
        return
    scripts = package["scripts"]
    if frontend:
        script_ok = all(name in scripts for name in ("dev", "build"))
        result.add("frontend_scripts", script_ok, "Frontend package must define dev and build scripts" if not script_ok else "Frontend dev/build scripts exist", details={"file": "package.json"})
        entry = files.get("src/main.jsx", "")
        app = files.get("App.jsx", "")
        index = files.get("index.html", "")
        entry_ok = bool(re.search(r"(?:from\s*['\"](?:\.\.?/)*App(?:\.jsx)?['\"]|import\s*\(?\s*['\"](?:\.\.?/)*App(?:\.jsx)?['\"])", entry))
        result.add("frontend_entry_import", entry_ok, "src/main.jsx must import App.jsx" if not entry_ok else "Frontend entry imports App", details={"file": "src/main.jsx"})
        html_ok = bool(re.search(r"<script[^>]+src=['\"][^'\"]*src/main\.jsx['\"]", index))
        result.add("vite_html_entry", html_ok, "index.html must reference src/main.jsx" if not html_ok else "index.html references the Vite entry", details={"file": "index.html"})
        result.add("frontend_app_present", bool(app.strip()), "App.jsx is empty" if not app.strip() else "App.jsx is present", severity="info", details={"file": "App.jsx"})
    else:
        start_ok = "start" in scripts
        result.add("backend_start_script", start_ok, "Backend package must define a start script" if not start_ok else "Backend start script exists", details={"file": "package.json"})


def validate_manifest(files, stack: str, *, agent: str = "backend") -> ValidationResult:
    """Validate required artifacts and lightweight syntax/config invariants."""
    result = ValidationResult()
    mapping = _file_map(files)
    if agent == "frontend":
        required = FRONTEND_MANIFEST
    else:
        required = BACKEND_MANIFESTS.get(stack)
        if required is None:
            result.add("supported_stack", False, f"Unsupported backend stack: {stack}")
            return result
    missing = [name for name in required if name not in mapping]
    result.add("required_files", not missing, "Required files are present" if not missing else f"Missing required files: {', '.join(missing)}", details={"missing": missing, **({"file": missing[0]} if missing else {})})
    for name in missing:
        result.add(f"required_file:{name}", False, f"Missing required file: {name}", details={"file": name})
    empty = [name for name in required if name in mapping and not mapping[name].strip()]
    result.add("nonempty_files", not empty, "Required files are nonempty" if not empty else f"Empty required files: {', '.join(empty)}", details={"empty": empty, **({"file": empty[0]} if empty else {})})
    for name in empty:
        result.add(f"empty_file:{name}", False, f"Required file is empty: {name}", details={"file": name})
    _check_python(mapping, result)
    _check_package(mapping, result, frontend=agent == "frontend")
    if "requirements.txt" in mapping:
        lines = [line.strip() for line in mapping["requirements.txt"].splitlines() if line.strip() and not line.lstrip().startswith("#")]
        invalid = [line for line in lines if not PY_REQUIREMENT.match(line)]
        result.add("requirements_syntax", bool(lines) and not invalid, "requirements.txt contains valid requirement lines" if lines and not invalid else f"Invalid or empty requirements.txt entries: {invalid}", details={"invalid": invalid, "file": "requirements.txt"})
    return result
