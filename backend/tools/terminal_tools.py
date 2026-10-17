"""Compatibility helpers that delegate process execution to the sandbox runner."""
import shlex
import shutil
import sys
import tempfile
from pathlib import Path

from services.sandbox import _free_port, _run_server_probe, run_isolated_command


def _argv(command):
    args = shlex.split(command) if isinstance(command, str) else list(command)
    shell_chars = set(";&|<>`\n\r")
    shell_launcher = Path(args[0]).name.lower() in {"sh", "bash", "zsh", "fish", "cmd", "powershell"} if args else False
    if not args or shell_launcher or any(any(char in shell_chars for char in token) for token in args):
        raise ValueError("Commands must be nonempty argv lists without shell operators")
    return args


def run_python_file(filepath: str):
    path = Path(filepath).resolve()
    with tempfile.TemporaryDirectory(prefix="legacy-python-run-") as temporary:
        work = Path(temporary) / "project"
        shutil.copytree(path.parent, work)
        copied = work / path.name
        result = run_isolated_command([sys.executable, str(copied)], cwd=work, timeout=20)
    return {"success": result["passed"], "stdout": result["output"], "stderr": result["reason"] if not result["passed"] else "", "status": result["status"]}


def install_requirements(requirements_path: str):
    requirements = Path(requirements_path).resolve()
    with tempfile.TemporaryDirectory(prefix="legacy-deps-check-") as temporary:
        result = run_isolated_command(
            [sys.executable, "-m", "pip", "install", "--disable-pip-version-check", "--no-input", "--no-compile", "--target", str(Path(temporary) / "site"), "-r", str(requirements)],
            cwd=temporary, timeout=120,
        )
    return {"success": result["passed"], "stdout": result["output"], "stderr": "" if result["passed"] else result["output"], "status": result["status"]}


def run_fastapi_server(project_dir="generated_projects/generated_backend"):
    root = Path(project_dir).resolve()
    with tempfile.TemporaryDirectory(prefix="legacy-fastapi-run-") as temporary:
        work = Path(temporary) / "project"
        shutil.copytree(root, work)
        port = _free_port()
        result = _run_server_probe(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(port)],
            cwd=work, port=port, path="/health", timeout=20,
        )
    return {"success": result["passed"], "stdout": result.get("output", ""), "stderr": result.get("reason", ""), "status": result["status"]}


def test_api_endpoint():
    import urllib.request

    try:
        with urllib.request.urlopen("http://127.0.0.1:8000/", timeout=5) as response:
            body = response.read(200_000).decode("utf-8", errors="replace")
            return {"success": 200 <= response.status < 300, "status_code": response.status, "response": body}
    except Exception as exc:
        return {"success": False, "status_code": 500, "response": str(exc)}


def run_terminal_command(command, *, cwd="."):
    try:
        result = run_isolated_command(_argv(command), cwd=cwd, timeout=60)
        return {"success": result["passed"], "stdout": result["output"], "stderr": "" if result["passed"] else result["output"], "status": result["status"]}
    except Exception as exc:
        return {"success": False, "stdout": "", "stderr": str(exc), "status": "failed"}


def git_command(command, *, cwd="generated_projects"):
    return run_terminal_command(command, cwd=cwd)
