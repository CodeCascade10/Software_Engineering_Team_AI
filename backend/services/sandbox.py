"""Resource-limited runner for generated project validation commands.

The runner creates a fresh environment allowlist, writes artifacts only below a
temporary directory, caps captured output, and kills the complete process group
on timeout or output overflow. The subprocess mode is not a network sandbox;
use Docker mode for network-isolated code execution.
"""
import os
import shutil
import signal
import subprocess
import tempfile
import threading
import time
import socket
import sys
import urllib.error
import urllib.request
from pathlib import Path

from agents.file_output import normalize_file_path
from config.settings import settings


def _resource_limits():
    try:
        import resource

        resource.setrlimit(resource.RLIMIT_CPU, (settings.SANDBOX_CPU_SECONDS, settings.SANDBOX_CPU_SECONDS))
        memory = settings.SANDBOX_MEMORY_MB * 1024 * 1024
        if hasattr(resource, "RLIMIT_AS"):
            resource.setrlimit(resource.RLIMIT_AS, (memory, memory))
        if hasattr(resource, "RLIMIT_FSIZE"):
            resource.setrlimit(resource.RLIMIT_FSIZE, (settings.SANDBOX_OUTPUT_LIMIT_BYTES * 4,) * 2)
    except (ImportError, OSError, ValueError):
        return


def _kill_process(proc):
    try:
        if os.name == "posix":
            os.killpg(proc.pid, signal.SIGKILL)
        else:
            proc.kill()
    except (ProcessLookupError, OSError):
        pass


def run_isolated_command(command, *, cwd, timeout=None, output_limit=None, env_additions=None):
    """Run an argv command with no inherited application secrets."""
    cwd = Path(cwd).resolve()
    output_limit = output_limit or settings.SANDBOX_OUTPUT_LIMIT_BYTES
    timeout = timeout or settings.SANDBOX_TIMEOUT_SECONDS
    env = {
        "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
        "HOME": str(cwd),
        "TMPDIR": str(cwd),
        "LANG": "C.UTF-8",
        "CI": "1",
    }
    env.update(env_additions or {})
    started = time.monotonic()
    kwargs = {"cwd": cwd, "env": env, "stdout": subprocess.PIPE, "stderr": subprocess.STDOUT}
    if os.name == "posix":
        kwargs.update(start_new_session=True, preexec_fn=_resource_limits)
    proc = subprocess.Popen(list(command), **kwargs)
    captured = bytearray()
    overflow = threading.Event()

    def consume():
        while True:
            chunk = proc.stdout.read(4096)
            if not chunk:
                break
            remaining = output_limit - len(captured)
            if remaining > 0:
                captured.extend(chunk[:remaining])
            if len(chunk) > remaining:
                overflow.set()
                _kill_process(proc)
                break

    reader = threading.Thread(target=consume, daemon=True)
    reader.start()
    timed_out = False
    try:
        proc.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        timed_out = True
        _kill_process(proc)
        proc.wait()
    reader.join(timeout=2)
    if timed_out:
        status = "timeout"
    elif overflow.is_set():
        status = "output_limit"
    else:
        status = "passed" if proc.returncode == 0 else "failed"
    return {
        "status": status,
        "passed": status == "passed",
        "exit_code": proc.returncode,
        "output": captured.decode("utf-8", errors="replace"),
        "output_truncated": overflow.is_set(),
        "duration_seconds": round(time.monotonic() - started, 3),
        "command": list(command),
        "limits": {"timeout_seconds": timeout, "output_bytes": output_limit, "memory_mb": settings.SANDBOX_MEMORY_MB, "cpu_seconds": settings.SANDBOX_CPU_SECONDS},
    }


def _run_server_probe(command, *, cwd, port, path, timeout, env_additions=None):
    cwd = Path(cwd).resolve()
    env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "HOME": str(cwd), "TMPDIR": str(cwd), "LANG": "C.UTF-8", "CI": "1"}
    env.update(env_additions or {})
    env["PORT"] = str(port)
    kwargs = {"cwd": cwd, "env": env, "stdout": subprocess.PIPE, "stderr": subprocess.STDOUT}
    if os.name == "posix":
        kwargs.update(start_new_session=True, preexec_fn=_resource_limits)
    proc = subprocess.Popen(list(command), **kwargs)
    captured = bytearray()
    overflow = threading.Event()

    def consume():
        for chunk in iter(lambda: proc.stdout.read(4096), b""):
            remaining = settings.SANDBOX_OUTPUT_LIMIT_BYTES - len(captured)
            if remaining > 0:
                captured.extend(chunk[:remaining])
            if len(chunk) > remaining:
                overflow.set()
                _kill_process(proc)
                break

    reader = threading.Thread(target=consume, daemon=True)
    reader.start()
    started = time.monotonic()
    last_error = "server did not become ready"
    passed = False
    try:
        while time.monotonic() - started < timeout and proc.poll() is None:
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{port}{path}", timeout=1) as response:
                    if 200 <= response.status < 300:
                        passed = True
                        break
                    last_error = f"health endpoint returned HTTP {response.status}"
            except (OSError, urllib.error.URLError) as exc:
                last_error = str(exc)
            time.sleep(0.2)
    finally:
        _kill_process(proc)
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()
        reader.join(timeout=2)
    status = "passed" if passed else ("output_limit" if overflow.is_set() else "failed")
    return {
        "status": status, "passed": passed, "exit_code": proc.returncode,
        "output": captured.decode("utf-8", errors="replace"), "output_truncated": overflow.is_set(),
        "duration_seconds": round(time.monotonic() - started, 3), "reason": None if passed else last_error,
    }


def _docker_run(root, subdir, image, command, *, env_additions=None, timeout=None):
    args = [
        "docker", "run", "--rm", "--network", "none",
        "--memory", f"{settings.SANDBOX_MEMORY_MB}m", "--cpus", "1",
        "--pids-limit", "64", "--cap-drop", "ALL",
        "--security-opt", "no-new-privileges",
        "-v", f"{Path(root).resolve()}:/workspace:rw",
        "-w", f"/workspace/{subdir}", "--user", "65534:65534",
    ]
    for key, value in (env_additions or {}).items():
        args.extend(["-e", f"{key}={value}"])
    args.extend([image, *command])
    return run_isolated_command(args, cwd=root, timeout=timeout)


def _docker_smoke(root, stack, path, contract):
    port = 18765
    if stack == "FastAPI":
        (Path(root) / "smoke_probe.py").write_text(
            "import subprocess,sys,time,urllib.request,urllib.error\n"
            "path=sys.argv[1]; p=subprocess.Popen([sys.executable,'-m','uvicorn','main:app','--host','127.0.0.1','--port','18765'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)\n"
            "ok=False; end=time.monotonic()+60\n"
            "while time.monotonic()<end and p.poll() is None:\n"
            " try:\n  urllib.request.urlopen('http://127.0.0.1:18765'+path,timeout=1); ok=True; break\n"
            " except Exception: time.sleep(.2)\n"
            "p.terminate(); p.wait(timeout=3); sys.exit(0 if ok else 1)\n",
            encoding="utf-8",
        )
        image = f"python:{sys.version_info.major}.{sys.version_info.minor}-slim"
        return _docker_run(root, "backend", image, ["python", "/workspace/smoke_probe.py", path], env_additions={"PYTHONPATH": "/workspace/backend/.sandbox-deps"}, timeout=settings.SANDBOX_TIMEOUT_SECONDS)
    (Path(root) / "smoke_probe.cjs").write_text(
        "const {spawn}=require('child_process'); const p=spawn('npm',['start'],{env:{PATH:process.env.PATH,HOME:'/tmp',PORT:'18765'},stdio:'ignore'}); "
        "const end=Date.now()+60000; (async()=>{let ok=false; while(Date.now()<end&&p.exitCode===null){try{const r=await fetch('http://127.0.0.1:18765'+process.argv[2]);if(r.ok){ok=true;break}}catch{} await new Promise(r=>setTimeout(r,200))} "
        "p.kill('SIGTERM'); process.exit(ok?0:1)})();",
        encoding="utf-8",
    )
    return _docker_run(root, "backend", "node:22-slim", ["node", "/workspace/smoke_probe.cjs", path], timeout=settings.SANDBOX_TIMEOUT_SECONDS)


def validate_generated_project(files, stack, contract=None):
    """Run optional isolated build/import/smoke checks; skipped is not a pass."""
    if not settings.VALIDATION_SANDBOX_ENABLED:
        return {"status": "skipped", "passed": False, "mandatory": False, "reason": "VALIDATION_SANDBOX_ENABLED is false"}
    mode = settings.SANDBOX_MODE
    if mode not in {"subprocess", "docker"}:
        return {"status": "failed", "passed": False, "mandatory": True, "reason": f"Unsupported SANDBOX_MODE: {mode}"}
    if mode == "docker" and not shutil.which("docker"):
        return {"status": "failed", "passed": False, "mandatory": True, "reason": "SANDBOX_MODE=docker but Docker is unavailable"}

    with tempfile.TemporaryDirectory(prefix="agent-validation-") as temporary:
        root = Path(temporary)
        for item in files:
            name = item["file_name"]
            if name in {"architecture.md", "review.md"}:
                continue
            safe_name = normalize_file_path(name)
            destination = root.joinpath(*safe_name.split("/"))
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(item["content"], encoding="utf-8")
            os.chmod(destination.parent, 0o777)
        os.chmod(root, 0o755)

        commands = []
        backend_dir, frontend_dir = root / "backend", root / "frontend"
        if stack == "FastAPI":
            req = backend_dir / "requirements.txt"
            deps = backend_dir / ".sandbox-deps"
            if req.exists():
                install = run_isolated_command(
                    [sys.executable, "-m", "pip", "install", "--disable-pip-version-check", "--no-input", "--no-compile", "--target", str(deps), "-r", str(req)],
                    cwd=backend_dir,
                )
                commands.append({"name": "backend_dependencies", **install})
                if not install["passed"]:
                    return {"status": "failed", "passed": False, "mandatory": True, "checks": commands}
            python = sys.executable
            env = {"PYTHONPATH": str(deps)}
            syntax = run_isolated_command([python, "-m", "compileall", "-q", "."], cwd=backend_dir)
            commands.append({"name": "backend_compile", **syntax})
            if not syntax["passed"]:
                return {"status": "failed", "passed": False, "mandatory": True, "checks": commands}
            imported = (
                _docker_run(root, "backend", f"python:{sys.version_info.major}.{sys.version_info.minor}-slim", ["python", "-c", "import main"], env_additions={"PYTHONPATH": "/workspace/backend/.sandbox-deps"})
                if mode == "docker" else
                run_isolated_command([python, "-c", "import main"], cwd=backend_dir, env_additions=env)
            )
            commands.append({"name": "backend_import", **imported})
            if not imported["passed"]:
                return {"status": "failed", "passed": False, "mandatory": True, "checks": commands}
            port = _free_port()
            contract_path = _probe_path(contract)
            probe = (
                _docker_smoke(root, stack, contract_path, contract)
                if mode == "docker" else
                _run_server_probe([python, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(port)], cwd=backend_dir, port=port, path=contract_path, timeout=settings.SANDBOX_TIMEOUT_SECONDS, env_additions=env)
            )
            commands.append({"name": "backend_startup_smoke", **probe})
            if not probe["passed"]:
                return {"status": "failed", "passed": False, "mandatory": True, "checks": commands}
        else:
            install = run_isolated_command(["npm", "install", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false"], cwd=backend_dir)
            commands.append({"name": "backend_dependencies", **install})
            if not install["passed"]:
                return {"status": "failed", "passed": False, "mandatory": True, "checks": commands}
            server_file = backend_dir / "server.js"
            syntax = (
                _docker_run(root, "backend", "node:22-slim", ["node", "--check", "/workspace/backend/server.js"])
                if mode == "docker" else
                run_isolated_command([shutil.which("node") or "node", "--check", str(server_file)], cwd=backend_dir)
            )
            commands.append({"name": "backend_compile", **syntax})
            if not syntax["passed"]:
                return {"status": "failed", "passed": False, "mandatory": True, "checks": commands}
            port = _free_port()
            probe = (
                _docker_smoke(root, stack, _probe_path(contract), contract)
                if mode == "docker" else
                _run_server_probe(["npm", "start"], cwd=backend_dir, port=port, path=_probe_path(contract), timeout=settings.SANDBOX_TIMEOUT_SECONDS)
            )
            commands.append({"name": "backend_startup_smoke", **probe})
            if not probe["passed"]:
                return {"status": "failed", "passed": False, "mandatory": True, "checks": commands}

        install = run_isolated_command(["npm", "install", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false"], cwd=frontend_dir)
        commands.append({"name": "frontend_dependencies", **install})
        if not install["passed"]:
            return {"status": "failed", "passed": False, "mandatory": True, "checks": commands}
        build = (
            _docker_run(root, "frontend", "node:22-slim", ["npm", "run", "build"])
            if mode == "docker" else
            run_isolated_command(["npm", "run", "build"], cwd=frontend_dir)
        )
        commands.append({"name": "frontend_build", **build})
        return {"status": "passed" if build["passed"] else "failed", "passed": build["passed"], "mandatory": True, "checks": commands}


def _free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def _probe_path(contract):
    for endpoint in contract or []:
        if str(endpoint.get("method", "")).upper() != "GET" or endpoint.get("auth") is True:
            continue
        path = endpoint.get("path", "/")
        path = __import__("re").sub(r"\{[^}]+\}|:[A-Za-z_][A-Za-z0-9_]*", "validation-probe", path)
        return path
    return "/"
