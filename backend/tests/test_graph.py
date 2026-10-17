import json

import pytest

from agents import backend_agent, frontend_agent, planner_agent, reviewer_agent, validation_agent
from config.settings import settings
import graph.builder as graph_builder
from graph.builder import MAX_REPAIR_ATTEMPTS, build_graph
from tests.conftest import FakeLLM
from tests.workflow_fixtures import backend_text, frontend_text, plan_data, review_text


def configure_graph(monkeypatch, stack, *, reviews=None, backends=None, frontends=None, planner_response=None):
    monkeypatch.setattr(settings, "VALIDATION_SANDBOX_ENABLED", False)
    monkeypatch.setattr(settings, "ALLOW_SKIPPED_SANDBOX_COMPLETION", True)
    monkeypatch.setattr(planner_agent, "llm", FakeLLM(planner_response or json.dumps(plan_data(stack))))
    monkeypatch.setattr(backend_agent, "llm", FakeLLM(*(backends or [backend_text(stack)])))
    monkeypatch.setattr(frontend_agent, "llm", FakeLLM(*(frontends or [frontend_text()])))
    monkeypatch.setattr(reviewer_agent, "llm", FakeLLM(*(reviews or [review_text(stack)])))
    monkeypatch.setattr(graph_builder, "save_workflow_log", lambda *a, **k: True)
    for module in (planner_agent, backend_agent, frontend_agent, reviewer_agent, validation_agent):
        monkeypatch.setattr(module, "save_workflow_log", lambda *a, **k: True)
        if hasattr(module, "append_log"):
            monkeypatch.setattr(module, "append_log", lambda *a, **k: None)
    return {
        "project_id": "offline-project", "run_id": "offline-run",
        "project_name": "Health service", "project_stack": stack,
        "user_prompt": "Create a health endpoint", "generated_files": [],
        "repair_attempts": 0, "stage_attempts": {}, "stage_timings": {},
    }


@pytest.mark.parametrize("stack", ["FastAPI", "MERN"])
def test_graph_completes_each_supported_stack_offline(stack, monkeypatch):
    result = build_graph().invoke(configure_graph(monkeypatch, stack))
    assert result["status"] == "completed"
    assert result["validation_passed"] is True
    assert result["verdict"] == "PASS"
    assert result["repair_attempts"] == 0
    assert any(item["file_name"] == "backend/package.json" for item in result["generated_files"]) == (stack == "MERN")
    assert any(item["file_name"] == "frontend/package.json" for item in result["generated_files"])


def test_reviewer_needs_changes_triggers_repair_then_completes(monkeypatch):
    findings = [{"severity":"high","file":"backend/main.py","description":"Fix health response","suggested_fix":"Return the expected object"}]
    state = configure_graph(
        monkeypatch, "FastAPI",
        reviews=[review_text("FastAPI","NEEDS_CHANGES",findings), review_text("FastAPI")],
        backends=[backend_text("FastAPI"), backend_text("FastAPI")],
    )
    result = build_graph().invoke(state)
    assert result["status"] == "completed"
    assert result["repair_attempts"] == 1
    assert result["stage_attempts"]["backend"] >= 1


def test_persistent_review_findings_end_needs_review_after_repair_limit(monkeypatch):
    findings = [{"severity":"high","file":"backend/main.py","description":"Still incorrect","suggested_fix":"Correct it"}]
    state = configure_graph(
        monkeypatch, "FastAPI",
        reviews=[review_text("FastAPI","NEEDS_CHANGES",findings) for _ in range(MAX_REPAIR_ATTEMPTS + 1)],
        backends=[backend_text("FastAPI") for _ in range(MAX_REPAIR_ATTEMPTS + 1)],
    )
    result = build_graph().invoke(state)
    assert result["status"] == "needs_review"
    assert result["repair_attempts"] == MAX_REPAIR_ATTEMPTS
    assert result["generated_files"]


def test_graph_does_not_complete_without_a_nonempty_planned_task_list():
    from graph.builder import finish_after_review

    assert finish_after_review({
        "validation_passed": True,
        "verdict": "PASS",
        "tasks": [],
        "task_status": [],
        "repair_attempts": 2,
    }) == "needs_review"


def test_model_exception_ends_in_failed_terminal_state(monkeypatch):
    state = configure_graph(monkeypatch, "FastAPI", planner_response=RuntimeError("provider offline"))
    result = build_graph().invoke(state)
    assert result["status"] == "failed"
    assert "provider offline" in result["workflow_error"]


def test_reviewer_output_exhaustion_ends_graph_failed(monkeypatch):
    state = configure_graph(monkeypatch, "FastAPI", reviews=["plain prose"] * 3)
    result = build_graph().invoke(state)
    assert result["status"] == "failed"
    assert "invalid_review_output" in result["workflow_error"]


def test_skipped_sandbox_blocks_completion_unless_explicitly_allowed(monkeypatch):
    state = configure_graph(
        monkeypatch, "FastAPI",
        reviews=[review_text("FastAPI") for _ in range(MAX_REPAIR_ATTEMPTS + 1)],
        backends=[backend_text("FastAPI") for _ in range(MAX_REPAIR_ATTEMPTS + 1)],
        frontends=[frontend_text() for _ in range(MAX_REPAIR_ATTEMPTS + 1)],
    )
    monkeypatch.setattr(settings, "ALLOW_SKIPPED_SANDBOX_COMPLETION", False)
    result = build_graph().invoke(state)
    assert result["sandbox_result"]["status"] == "skipped"
    assert result["validation_passed"] is False
    assert result["status"] == "needs_review"


def test_contract_failure_repairs_and_feedback_reaches_backend_prompt(monkeypatch):
    bad = backend_text("FastAPI").replace("@app.get('/health')", "@app.get('/wrong')")
    state = configure_graph(
        monkeypatch, "FastAPI",
        reviews=[review_text("FastAPI") for _ in range(MAX_REPAIR_ATTEMPTS + 1)],
        backends=[bad, backend_text("FastAPI"), backend_text("FastAPI")],
    )
    result = build_graph().invoke(state)
    assert result["repair_attempts"] >= 1
    assert any("contract_backend:GET:/health" in str(prompt) for prompt in backend_agent.llm.prompts[1:])


def test_missing_task_deliverable_repairs_and_routes_to_owner(monkeypatch):
    import graph.builder as gb
    from agents.file_output import extract_generated_files
    from agents.state_utils import merge_files

    plan = plan_data("FastAPI")
    plan["tasks"][0]["deliverable"].append("extra.py")
    state = configure_graph(monkeypatch, "FastAPI", planner_response=json.dumps(plan), reviews=[review_text("FastAPI")]*2)
    calls = []

    def fake_backend(current):
        calls.append(current)
        backend_files = extract_generated_files(backend_text("FastAPI"))
        if current.get("repair_mode"):
            backend_files.append({"file_name":"extra.py","content":"VALUE = 1"})
        return {
            "backend_files":backend_files,
            "backend_code":"backend fixture",
            "backend_tasks_completed":["T1"],
            "generated_files":merge_files(
                current.get("generated_files", []),
                [{**item,"file_name":f"backend/{item['file_name']}"} for item in backend_files],
            ),
        }

    monkeypatch.setattr(gb, "backend_agent", fake_backend)
    result = build_graph().invoke(state)
    assert result["status"] == "completed"
    assert len(calls) >= 2
    assert "backend" in calls[1]["repair_targets"]
    assert any("backend/extra.py" in str(item) for item in calls[1]["repair_feedback"])


def test_every_stage_logs_start_attempt_and_timed_end(monkeypatch):
    events = []
    def record(*args, **kwargs):
        events.append((kwargs.get("stage"), kwargs.get("event"), kwargs))
        return True
    state = configure_graph(monkeypatch, "FastAPI")
    monkeypatch.setattr(graph_builder, "save_workflow_log", record)
    for module in (planner_agent, backend_agent, frontend_agent, reviewer_agent, validation_agent):
        monkeypatch.setattr(module, "save_workflow_log", record)
    result = build_graph().invoke(state)
    assert result["status"] == "completed"
    for stage in ("planner", "backend", "frontend", "validate", "reviewer"):
        stage_events = [(event, kwargs) for item_stage, event, kwargs in events if item_stage == stage]
        assert any(event == "start" for event, _ in stage_events), stage
        assert any(event == "attempt" for event, _ in stage_events), stage
        assert any(event == "end" and "duration_seconds" in kwargs for event, kwargs in stage_events), stage


def test_syntax_error_is_named_and_repaired_through_validation(monkeypatch):
    import graph.builder as gb
    from agents.file_output import extract_generated_files
    from agents.state_utils import merge_files
    state = configure_graph(
        monkeypatch, "FastAPI", reviews=[review_text("FastAPI")]*2,
        frontends=[frontend_text()]*2,
    )
    calls=[]
    def fake_backend(current):
        calls.append(current)
        files=extract_generated_files(backend_text("FastAPI"))
        if len(calls)==1:
            files[0]["content"]="def broken(:"
        return {"backend_files":files,"backend_tasks_completed":["T1"],"backend_code":"fixture",
                "generated_files":merge_files(current.get("generated_files",[]),[{**item,"file_name":f"backend/{item['file_name']}"} for item in files])}
    monkeypatch.setattr(gb,"backend_agent",fake_backend)
    result=build_graph().invoke(state)
    assert result["status"]=="completed"
    assert result["repair_attempts"]>=1
    assert len(calls)>=2
    assert "main.py" in str(calls[1].get("repair_feedback",[]))
