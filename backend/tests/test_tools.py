import sys
import ast
from pathlib import Path

from config.settings import settings
from services.sandbox import run_isolated_command, validate_generated_project
from services import workflow_logger


def test_sandbox_timeout_is_enforced(tmp_path):
    result = run_isolated_command(
        [sys.executable, "-c", "import time; time.sleep(5)"],
        cwd=tmp_path, timeout=0.15,
    )
    assert result["status"] == "timeout"
    assert result["duration_seconds"] < 3


def test_sandbox_does_not_inherit_secrets(tmp_path, monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "must-not-leak")
    result = run_isolated_command(
        [sys.executable, "-c", "import os; print(os.getenv('GROQ_API_KEY', 'absent'))"],
        cwd=tmp_path,
    )
    assert result["passed"]
    assert result["output"].strip() == "absent"


def test_sandbox_caps_output(tmp_path):
    result = run_isolated_command(
        [sys.executable, "-c", "print('x' * 100000)"],
        cwd=tmp_path, output_limit=128,
    )
    assert result["status"] == "output_limit"
    assert len(result["output"].encode()) <= 128


def test_disabled_sandbox_is_reported_as_skipped(monkeypatch):
    monkeypatch.setattr(settings, "VALIDATION_SANDBOX_ENABLED", False)
    result = validate_generated_project([], "FastAPI")
    assert result["status"] == "skipped"
    assert result["passed"] is False
    assert result["mandatory"] is False


def test_workflow_log_failure_is_counted_and_logged_without_live_mongo(monkeypatch, caplog):
    class BadCollection:
        def insert_one(self, _):
            raise RuntimeError("mocked unavailable DB")
        def update_one(self, *_args, **_kwargs):
            raise RuntimeError("mocked unavailable DB")
    class Database:
        workflow_logs = BadCollection()
        workflow_runs = BadCollection()
    class Client:
        ai_software_team = Database()

    run_id = "offline-telemetry-test"
    monkeypatch.setattr(workflow_logger.settings, "MONGO_URI", "mongodb://mock-only")
    monkeypatch.setattr(workflow_logger, "_client", Client())
    workflow_logger._failure_counts.pop(run_id, None)
    assert workflow_logger.save_workflow_log("p", "Planner", "message", run_id=run_id) is False
    assert workflow_logger.get_telemetry_failure_count(run_id) == 1
    assert "Could not persist workflow progress" in caplog.text


def test_workflow_log_failure_increments_durable_run_counter(monkeypatch):
    class BadLogs:
        def insert_one(self, _):
            raise RuntimeError("mocked log database outage")
    class Runs:
        def __init__(self): self.values = {}
        def update_one(self, query, update):
            key = query["_id"]
            for field, amount in update.get("$inc", {}).items():
                self.values[field] = self.values.get(field, 0) + amount
    class Database:
        workflow_logs = BadLogs()
        workflow_runs = Runs()
    class Client:
        ai_software_team = Database()

    run_id = "offline-durable-telemetry"
    monkeypatch.setattr(workflow_logger.settings, "MONGO_URI", "mongodb://mock-only")
    monkeypatch.setattr(workflow_logger, "_client", Client())
    workflow_logger._failure_counts.pop(run_id, None)
    assert workflow_logger.save_workflow_log("p", "Planner", "message", run_id=run_id) is False
    assert workflow_logger._client.ai_software_team.workflow_runs.values["telemetry_error_count"] == 1


def test_process_execution_primitives_exist_only_in_sandbox_source():
    backend_root = Path(__file__).resolve().parents[1]
    violations = []
    for path in backend_root.rglob("*.py"):
        relative = path.relative_to(backend_root)
        if "venv" in relative.parts or "tests" in relative.parts or "generated_projects" in relative.parts:
            continue
        if relative.as_posix() == "services/sandbox.py":
            continue
        try:
            tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        except SyntaxError:
            continue
        for node in ast.walk(tree):
            if isinstance(node, ast.Import) and any(alias.name == "subprocess" or alias.name.startswith("subprocess.") for alias in node.names):
                violations.append(f"{relative}:{node.lineno}: subprocess import")
            if isinstance(node, ast.ImportFrom) and node.module and node.module.startswith("subprocess"):
                violations.append(f"{relative}:{node.lineno}: subprocess import")
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in {"eval", "exec"}:
                    violations.append(f"{relative}:{node.lineno}: {node.func.id} call")
                if isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name) and node.func.value.id == "os" and node.func.attr == "system":
                    violations.append(f"{relative}:{node.lineno}: os.system call")
    assert not violations, "\n".join(violations)


def test_legacy_terminal_command_rejects_shell_syntax():
    from tools.terminal_tools import run_terminal_command
    result = run_terminal_command("echo safe; echo unsafe")
    assert result["success"] is False
    assert "argv lists" in result["stderr"]
