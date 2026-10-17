from agents.validation_agent import validate_agent
from graph.builder import _repair_targets
from tests.workflow_fixtures import backend_text, frontend_text
from agents.manifests import validate_manifest


def files(text):
    from agents.file_output import extract_generated_files
    return extract_generated_files(text)


def test_python_syntax_finding_names_file_and_routes_to_backend(monkeypatch):
    import agents.validation_agent as module
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    backend = files(backend_text("FastAPI"))
    backend[0]["content"] = "def broken(:"
    syntax_result = validate_manifest(backend, "FastAPI")
    syntax_check = next(check for check in syntax_result.checks if check.name == "python_syntax:main.py")
    assert syntax_check.details["file"] == "main.py"
    assert syntax_check.details["line"] == 1
    state = {
        "project_id":"validation", "project_stack":"FastAPI", "api_contract":[{"method":"GET","path":"/health"}],
        "backend_files":backend, "frontend_files":files(frontend_text()),
        "generated_files":[{"file_name":f"backend/{f['file_name']}","content":f["content"]} for f in backend],
        "tasks":[], "backend_tasks_completed":[], "frontend_tasks_completed":[],
    }
    result = validate_agent(state)
    finding = next(item for item in result["findings"] if item.get("check") == "python_syntax:main.py")
    assert finding["file"] == "main.py"
    assert finding["owner"] == "backend"
    assert "backend" in _repair_targets({**state, **result})


def test_invalid_frontend_package_finding_names_file_and_routes_to_frontend(monkeypatch):
    import agents.validation_agent as module
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    backend = files(backend_text("FastAPI"))
    frontend = files(frontend_text())
    package = next(item for item in frontend if item["file_name"] == "package.json")
    package["content"] = "{ invalid json"
    state = {
        "project_id":"validation", "project_stack":"FastAPI", "api_contract":[{"method":"GET","path":"/health"}],
        "backend_files":backend, "frontend_files":frontend,
        "generated_files":([
            {"file_name":f"backend/{f['file_name']}","content":f["content"]} for f in backend
        ] + [{"file_name":f"frontend/{f['file_name']}","content":f["content"]} for f in frontend]),
        "tasks":[], "backend_tasks_completed":[], "frontend_tasks_completed":[],
    }
    result = validate_agent(state)
    finding = next(item for item in result["findings"] if item.get("check") == "package_json")
    assert finding["file"] == "package.json"
    assert finding["owner"] == "frontend"
    assert "frontend" in _repair_targets({**state, **result})
