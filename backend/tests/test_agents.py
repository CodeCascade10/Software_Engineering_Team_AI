import json

import pytest
from pydantic import ValidationError

from agents.planner_agent import parse_plan, planner_agent
from agents.file_output import FileOutputError
from tests.conftest import FakeLLM


def valid_plan(stack="FastAPI"):
    return {
        "goals": ["Deliver a health service"],
        "architecture_decisions": ["Use the selected stack"],
        "api_contract": [{
            "method": "GET", "path": "/health", "request_schema": {},
            "response_schema": {"ok": "boolean"}, "auth": False,
            "error_responses": {}, "owner_tasks": ["T1"],
        }],
        "security_constraints": ["Read secrets from environment variables"],
        "selected_stack": stack,
        "tasks": [
            {"id": "T1", "owner": "backend", "deliverable": ["main.py"], "dependencies": [], "acceptance_criteria": ["main.py exists"]},
            {"id": "T2", "owner": "frontend", "deliverable": ["App.jsx"], "dependencies": ["T1"], "acceptance_criteria": ["App.jsx exists"]},
        ],
    }


def test_planner_accepts_json_with_prose_and_fence():
    plan = valid_plan()
    fence = chr(96) * 3
    response = "Plan follows:\n" + fence + "json\n" + json.dumps(plan) + "\n" + fence + "\nDone."
    result = parse_plan(response, "FastAPI")
    assert result.tasks[0].id == "T1"
    assert result.api_contract[0].path == "/health"


@pytest.mark.parametrize("mutate", [
    lambda p: p.pop("security_constraints"),
    lambda p: p["tasks"].append(dict(p["tasks"][0])),
    lambda p: (p["tasks"][0].update(dependencies=["T2"]), p["tasks"][1].update(dependencies=["T1"])),
])
def test_planner_rejects_missing_sections_duplicate_ids_and_cycles(mutate):
    plan = valid_plan()
    mutate(plan)
    with pytest.raises((ValueError, ValidationError)):
        parse_plan(json.dumps(plan), "FastAPI")


def test_planner_rejects_wrong_stack_and_non_json():
    with pytest.raises(ValueError):
        parse_plan(json.dumps(valid_plan("MERN")), "FastAPI")
    with pytest.raises((ValueError, ValidationError)):
        parse_plan("not json", "FastAPI")


def test_planner_rejects_unknown_dependency_with_specific_message():
    plan = valid_plan()
    plan["tasks"][1]["dependencies"] = ["T404"]
    with pytest.raises(ValidationError, match="unknown dependencies.*T404"):
        parse_plan(json.dumps(plan), "FastAPI")


def test_planner_retries_validation_errors_then_accepts(monkeypatch):
    module = __import__("agents.planner_agent", fromlist=["planner_agent"])
    fake = FakeLLM("not json", json.dumps(valid_plan()))
    monkeypatch.setattr(module, "llm", fake)
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    result = planner_agent({"project_id": "p", "project_name": "Demo", "project_stack": "FastAPI", "user_prompt": "Create a health service"})
    assert len(fake.prompts) == 2
    assert result["tasks"][0]["id"] == "T1"
    assert "Architecture Plan" in result["plan_content"]


def test_planner_fails_after_retry_budget(monkeypatch):
    module = __import__("agents.planner_agent", fromlist=["planner_agent"])
    fake = FakeLLM("{}", "{}", "{}")
    monkeypatch.setattr(module, "llm", fake)
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    with pytest.raises(ValueError, match="after 3 attempts"):
        planner_agent({"project_id": "p", "project_name": "Demo", "project_stack": "FastAPI", "user_prompt": "Create a health service"})


def backend_output(minimal=False):
    blocks = [
        ("main.py", "from fastapi import FastAPI\napp=FastAPI()"),
        ("routes/auth.py", "router=None"),
        ("database.py", "db=None"),
        ("models.py", "class User: pass"),
        ("requirements.txt", "fastapi>=0.100"),
        (".env.example", "MONGO_URI="),
    ]
    if minimal:
        blocks = blocks[:1] + blocks[4:5]
    fence = chr(96) * 3
    return "\n".join(f"FILE: {name}\n{fence}text\n{content}\n{fence}" for name, content in blocks)


def frontend_output(minimal=False):
    blocks = [
        ("index.html", '<script type="module" src="/src/main.jsx"></script>'),
        ("App.jsx", "export default function App(){return null}"),
        ("src/main.jsx", "import App from '../App.jsx';"),
        ("src/services/api.js", "export const api={};"),
        ("src/pages/Home.jsx", "export default function Home(){return null}"),
        ("package.json", json.dumps({"name":"web","scripts":{"dev":"vite","build":"vite build"},"dependencies":{"react":"*","react-dom":"*"}})),
    ]
    if minimal:
        blocks = blocks[1::4] + [blocks[-1]]
    fence = chr(96) * 3
    return "\n".join(f"FILE: {name}\n{fence}text\n{content}\n{fence}" for name, content in blocks)


def test_backend_agent_retries_until_full_manifest_and_task_deliverables(monkeypatch):
    module = __import__("agents.backend_agent", fromlist=["backend_agent"])
    fake = FakeLLM(backend_output(minimal=True), backend_output())
    monkeypatch.setattr(module, "llm", fake)
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    result = module.backend_agent({
        "project_id": "p", "project_stack": "FastAPI",
        "plan": {"tasks": [{"id":"T1","owner":"backend","deliverable":["main.py"],"acceptance_criteria":["main.py exists"]}]},
        "generated_files": [],
    })
    assert len(fake.prompts) == 2
    assert len(result["backend_files"]) == 6


def test_backend_agent_fails_when_manifest_retry_budget_is_exhausted(monkeypatch):
    module = __import__("agents.backend_agent", fromlist=["backend_agent"])
    fake = FakeLLM(backend_output(minimal=True), backend_output(minimal=True), backend_output(minimal=True))
    monkeypatch.setattr(module, "llm", fake)
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    with pytest.raises(FileOutputError, match="manifest_validation_failed"):
        module.backend_agent({"project_id":"p","project_stack":"FastAPI","plan":{"tasks":[]},"generated_files":[]})
    assert len(fake.prompts) == 3


def test_backend_agent_retries_when_a_task_deliverable_is_missing(monkeypatch):
    module = __import__("agents.backend_agent", fromlist=["backend_agent"])
    fake = FakeLLM(backend_output(), backend_output(), backend_output())
    monkeypatch.setattr(module, "llm", fake)
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    plan = {"tasks":[{"id":"T1","owner":"backend","deliverable":["routes/health.py"],"acceptance_criteria":["health route exists"]}]}
    with pytest.raises(FileOutputError, match="task_deliverables"):
        module.backend_agent({"project_id":"p","project_stack":"FastAPI","plan":plan,"generated_files":[]})
    assert len(fake.prompts) == 3


def test_frontend_agent_requires_the_complete_vite_manifest(monkeypatch):
    module = __import__("agents.frontend_agent", fromlist=["frontend_agent"])
    fake = FakeLLM(frontend_output(minimal=True), frontend_output())
    monkeypatch.setattr(module, "llm", fake)
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    result = module.frontend_agent({
        "project_id":"p","project_stack":"FastAPI","user_prompt":"Build UI",
        "backend_files":[{"file_name":"main.py","content":"app"}],
        "plan":{"tasks":[{"id":"T2","owner":"frontend","deliverable":["App.jsx"],"acceptance_criteria":["App.jsx exists"]}]},
        "generated_files":[],
    })
    assert len(fake.prompts) == 2
    assert len(result["frontend_files"]) == 6
    expected_manifest = ("index.html", "App.jsx", "src/main.jsx", "src/services/api.js", "src/pages/Home.jsx", "package.json")
    prompt_line = next(line for line in fake.prompts[0].splitlines() if line.startswith("Generate all files in this list:"))
    prompt_files = json.loads(prompt_line.split(":", 1)[1].strip().rstrip("."))
    from agents.manifests import FRONTEND_MANIFEST
    assert tuple(prompt_files) == expected_manifest
    assert tuple(prompt_files) == FRONTEND_MANIFEST


def test_reviewer_parses_json_and_overrides_pass_with_critical_finding(monkeypatch):
    module = __import__("agents.reviewer_agent", fromlist=["reviewer_agent"])
    response = {
        "verdict": "PASS", "summary": "Looks good.",
        "findings": [{"severity":"critical","file":"backend/main.py","description":"Unsafe query","suggested_fix":"Use a parameterized query"}],
        "verified_acceptance_criteria": [],
    }
    fake = FakeLLM(json.dumps(response))
    events = []
    monkeypatch.setattr(module, "llm", fake)
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: events.append(a))
    result = module.reviewer_agent({"project_id":"p","user_prompt":"Build service","generated_files":[{"file_name":"backend/main.py","content":"pass"}],"tasks":[]})
    assert result["verdict"] == "NEEDS_CHANGES"
    assert any("overridden" in event[2] for event in events)


def test_reviewer_retries_invalid_json_then_accepts(monkeypatch):
    module = __import__("agents.reviewer_agent", fromlist=["reviewer_agent"])
    valid = json.dumps({"verdict":"PASS","findings":[],"summary":"ok","verified_acceptance_criteria":[]})
    fake = FakeLLM("{invalid", valid)
    monkeypatch.setattr(module, "llm", fake)
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    result = module.reviewer_agent({"project_id":"p","user_prompt":"Build","generated_files":[{"file_name":"App.jsx","content":"export default 1"}],"tasks":[]})
    assert len(fake.prompts) == 2
    assert result["verdict"] == "PASS"


def test_reviewer_retries_non_json_then_raises_typed_error(monkeypatch):
    module = __import__("agents.reviewer_agent", fromlist=["reviewer_agent"])
    fake = FakeLLM("plain prose", "still prose", "not json")
    monkeypatch.setattr(module, "llm", fake)
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    with pytest.raises(module.ReviewOutputError, match="after 3 attempts") as error:
        module.reviewer_agent({"project_id":"p","user_prompt":"Build","generated_files":[{"file_name":"App.jsx","content":"export default 1"}],"tasks":[]})
    assert error.value.code == "invalid_review_output"
    assert len(fake.prompts) == 3


def test_reviewer_reports_truncated_files(monkeypatch):
    module = __import__("agents.reviewer_agent", fromlist=["reviewer_agent"])
    valid = json.dumps({"verdict":"PASS","findings":[],"summary":"partial","verified_acceptance_criteria":[]})
    monkeypatch.setattr(module, "llm", FakeLLM(valid))
    monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
    result = module.reviewer_agent({"project_id":"p","user_prompt":"Build","generated_files":[{"file_name":"large.js","content":"x"*(module.REVIEW_FILE_CHARS+1)}],"tasks":[]})
    assert any("reduced" in finding["description"] for finding in result["findings"])
