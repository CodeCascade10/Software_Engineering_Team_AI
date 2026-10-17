import time

from agents.contract_check import check_api_contract
from agents.manifests import validate_manifest
from agents.schemas import ValidationResult
from agents.state_utils import validation_failures
from agents.state_utils import stage_timings
from graph.state import GraphState
from config.settings import settings
from services.sandbox import validate_generated_project
from services.workflow_logger import save_workflow_log


def validate_agent(state: GraphState):
    project_id = state["project_id"]
    stage_started = time.monotonic()
    save_workflow_log(project_id, "Validation", "Validation started", run_id=state.get("run_id"), stage="validate", event="start")
    save_workflow_log(project_id, "Validation", "Running deterministic and sandbox checks", run_id=state.get("run_id"), stage="validate", event="attempt", attempt=state.get("stage_attempts", {}).get("validate", 0) + 1)
    stack = state.get("project_stack", "FastAPI")
    backend_files = state.get("backend_files", [])
    frontend_files = state.get("frontend_files", [])
    results = [
        validate_manifest(backend_files, stack),
        validate_manifest(frontend_files, stack, agent="frontend"),
        check_api_contract(state.get("api_contract", []), backend_files, frontend_files, stack),
    ]
    sandbox = validate_generated_project(state.get("generated_files", []), stack, state.get("api_contract", []))
    if sandbox.get("status") == "skipped":
        sandbox_result = ValidationResult()
        sandbox_result.add(
            "sandbox_build", False, sandbox.get("reason", "Sandbox build skipped"),
            severity="info", status="skipped", mandatory=not settings.ALLOW_SKIPPED_SANDBOX_COMPLETION,
        )
        results.append(sandbox_result)
    elif sandbox.get("status") == "failed":
        sandbox_result = ValidationResult()
        sandbox_result.add("sandbox_build", False, sandbox.get("reason", "Sandbox validation failed"), details=sandbox)
        results.append(sandbox_result)
    else:
        sandbox_result = ValidationResult()
        sandbox_result.add("sandbox_build", True, "Sandbox build and startup checks passed", severity="info", details=sandbox)
        results.append(sandbox_result)

    failures = validation_failures([result.model_dump(mode="json") for result in results])
    task_status = []
    completed = set(state.get("backend_tasks_completed", [])) | set(state.get("frontend_tasks_completed", []))
    file_names = {item["file_name"] for item in state.get("generated_files", [])}
    for task in state.get("tasks", []):
        deliverables = [f"backend/{path}" if task.get("owner") == "backend" else f"frontend/{path}" for path in task.get("deliverable", [])]
        present = all(path in file_names for path in deliverables)
        missing_deliverables = [path for path in deliverables if path not in file_names]
        task_status.append({
            "id": task["id"],
            "owner": task["owner"],
            "status": "completed" if task["id"] in completed and present else "incomplete",
            "missing_deliverables": missing_deliverables,
            "acceptance_criteria": [
                {
                    "criterion": criterion,
                    "deterministic_checks": ["task_deliverables_present"] if present and any(token in criterion.lower() for token in ("exists", "is present", "are present")) else [],
                    "reviewer_verified": False,
                }
                for criterion in task.get("acceptance_criteria", [])
            ],
        })
    finding_list = []
    for owner, result in zip(("backend", "frontend", "contract", "sandbox"), results):
        for check in result.model_dump(mode="json").get("checks", []):
            if check.get("passed") or not check.get("mandatory", True):
                continue
            details = check.get("details", {})
            file_name = details.get("file")
            if not file_name:
                name = check.get("name", "")
                if name.startswith(("python_syntax:", "required_file:", "empty_file:")):
                    file_name = name.split(":", 1)[1]
            finding = {
                "severity": check.get("severity", "high"),
                "file": file_name or ("package.json" if check.get("name", "").startswith(("package_json", "frontend_scripts", "backend_start_script")) else ""),
                "description": check.get("message", check.get("name", "Validation failed")),
                "suggested_fix": "Correct the validation failure and rerun the affected agent.",
                "source": "validation",
                "check": check.get("name"),
                "owner": owner if owner in {"backend", "frontend"} else "both",
            }
            finding_list.append(finding)
    save_workflow_log(project_id, "Validation", f"Validation completed with {len(failures)} mandatory failure(s)", "failed" if failures else "completed", run_id=state.get("run_id"), stage="validate", event="end", duration_seconds=time.monotonic() - stage_started, validation_outcomes=[result.model_dump(mode="json") for result in results])
    return {
        "validation_results": [result.model_dump(mode="json") for result in results],
        "validation_passed": not failures,
        "sandbox_result": sandbox,
        "findings": finding_list,
        "task_status": task_status,
        "current_agent": "Validation",
        "stage_attempts": {**state.get("stage_attempts", {}), "validate": state.get("stage_attempts", {}).get("validate", 0) + 1},
        "stage_timings": stage_timings(state, "validate", time.monotonic() - stage_started),
    }
