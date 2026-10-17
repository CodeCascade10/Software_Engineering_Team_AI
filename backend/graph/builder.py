from langgraph.graph import END, StateGraph

from agents.backend_agent import backend_agent
from agents.frontend_agent import frontend_agent
from agents.planner_agent import planner_agent
from agents.reviewer_agent import reviewer_agent
from agents.validation_agent import validate_agent
from config.settings import settings
from services.workflow_logger import save_workflow_log
from graph.state import GraphState


MAX_REPAIR_ATTEMPTS = settings.MAX_REPAIR_ATTEMPTS


def _repair_targets(state):
    backend_names = {item["file_name"] for item in state.get("backend_files", [])}
    frontend_names = {item["file_name"] for item in state.get("frontend_files", [])}
    targets = set()
    for check in state.get("validation_results", []):
        for item in check.get("checks", []):
            if item.get("passed") or not item.get("mandatory", True):
                continue
            name = item.get("name", "")
            if name.startswith("backend") or name.startswith("python") or name.startswith("requirements"):
                targets.add("backend")
            elif name.startswith("frontend") or name.startswith("vite"):
                targets.add("frontend")
            elif name.startswith("contract_") or name.startswith("backend_extra") or name.startswith("frontend_extra"):
                targets.update({"backend", "frontend"})
    for finding in state.get("findings", []):
        owner = finding.get("owner")
        if owner == "backend":
            targets.add("backend")
        elif owner == "frontend":
            targets.add("frontend")
        elif owner == "both":
            targets.update({"backend", "frontend"})
        path = finding.get("file", "")
        if path.startswith("backend/") or path in backend_names:
            targets.add("backend")
        if path.startswith("frontend/") or path in frontend_names:
            targets.add("frontend")
    if state.get("verdict") == "NEEDS_CHANGES" and not targets:
        targets.update({"backend", "frontend"})
    return sorted(targets or {"backend", "frontend"})


def prepare_repair(state: GraphState):
    return {
        "repair_attempts": state.get("repair_attempts", 0) + 1,
        "repair_targets": _repair_targets(state),
        "repair_feedback": state.get("findings", []),
        "repair_mode": True,
    }


def finish_completed(state: GraphState):
    return {"status": "completed", "current_agent": "Completed"}


def finish_needs_review(state: GraphState):
    return {"status": "needs_review", "current_agent": "Needs review"}


def finish_failed(state: GraphState):
    return {"status": "failed", "current_agent": "Failed"}


def _guard(agent, name):
    def run(state):
        try:
            return agent(state)
        except Exception as exc:
            message = f"{name} failed: {exc}"
            save_workflow_log(state["project_id"], name, message, "failed", run_id=state.get("run_id"), stage=name.lower().replace(" ", "_"), event="failure")
            return {
                "status": "failed",
                "workflow_error": message,
                "current_agent": name,
                "findings": [{"severity": "critical", "file": "", "description": message, "suggested_fix": "Review the stage error and retry the workflow.", "source": "stage"}],
            }
    return run


def after_planner(state: GraphState):
    return "failed" if state.get("status") == "failed" else "backend"


def finish_after_review(state: GraphState):
    if state.get("status") == "failed":
        return "failed"
    task_status = state.get("task_status", [])
    tasks_complete = bool(state.get("tasks")) and len(task_status) == len(state.get("tasks", [])) and all(
        task.get("status") == "completed" for task in task_status
    )
    if state.get("validation_passed") and state.get("verdict") == "PASS" and tasks_complete:
        return "completed"
    if state.get("repair_attempts", 0) < MAX_REPAIR_ATTEMPTS:
        return "repair"
    return "needs_review"


def after_backend(state: GraphState):
    if state.get("status") == "failed":
        return "failed"
    if not state.get("repair_mode") or "frontend" in state.get("repair_targets", []):
        return "frontend"
    return "validate"


def after_repair(state: GraphState):
    return "backend" if "backend" in state.get("repair_targets", []) else "frontend"


def after_frontend(state: GraphState):
    return "failed" if state.get("status") == "failed" else "validate"


def after_validate(state: GraphState):
    return "failed" if state.get("status") == "failed" else "reviewer"


def build_graph():
    workflow = StateGraph(GraphState)
    workflow.add_node("planner", _guard(planner_agent, "Planner"))
    workflow.add_node("backend", _guard(backend_agent, "Backend Dev"))
    workflow.add_node("frontend", _guard(frontend_agent, "Frontend Dev"))
    workflow.add_node("validate", _guard(validate_agent, "Validation"))
    workflow.add_node("reviewer", _guard(reviewer_agent, "Reviewer"))
    workflow.add_node("repair", prepare_repair)
    workflow.add_node("completed", finish_completed)
    workflow.add_node("needs_review", finish_needs_review)
    workflow.add_node("failed", finish_failed)
    workflow.set_entry_point("planner")
    workflow.add_conditional_edges("planner", after_planner, {"backend": "backend", "failed": "failed"})
    workflow.add_conditional_edges("backend", after_backend, {"frontend": "frontend", "validate": "validate", "failed": "failed"})
    workflow.add_conditional_edges("frontend", after_frontend, {"validate": "validate", "failed": "failed"})
    workflow.add_conditional_edges("validate", after_validate, {"reviewer": "reviewer", "failed": "failed"})
    workflow.add_conditional_edges(
        "reviewer", finish_after_review,
        {"completed": "completed", "repair": "repair", "needs_review": "needs_review", "failed": "failed"},
    )
    workflow.add_conditional_edges("repair", after_repair, {"backend": "backend", "frontend": "frontend"})
    workflow.add_edge("completed", END)
    workflow.add_edge("needs_review", END)
    workflow.add_edge("failed", END)
    return workflow.compile()
