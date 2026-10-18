import json
import time

from agents.file_output import FileOutputError, extract_generated_files
from agents.manifests import BACKEND_MANIFESTS, validate_manifest
from agents.state_utils import merge_files, stage_timings
from graph.state import GraphState
from services.llm_service import groq_llm
from services.workflow_logger import save_workflow_log
from tools.file_tools import append_log


llm = groq_llm()
MAX_GENERATION_RETRIES = 2


def _details(result):
    return [check.model_dump(mode="json") for check in result.checks if not check.passed]


def backend_agent(state: GraphState):
    project_id = state["project_id"]
    stage_started = time.monotonic()
    save_workflow_log(
        project_id,
        "Backend Dev",
        "Backend generation started",
        run_id=state.get("run_id"),
        stage="backend",
        event="start",
    )
    stack = state.get("project_stack", "FastAPI")
    if stack not in BACKEND_MANIFESTS:
        raise ValueError(f"Unsupported backend stack: {stack}")
    plan = state.get("plan", {})
    tasks = [task for task in plan.get("tasks", []) if task.get("owner") == "backend"]
    manifest = list(BACKEND_MANIFESTS[stack])
    for task in tasks:
        for path in task.get("deliverable", []):
            if path not in manifest:
                manifest.append(path)

    framework, language = (
        ("Node.js with Express and MongoDB/Mongoose", "JavaScript")
        if stack == "MERN"
        else ("Python FastAPI with MongoDB/Motor", "Python")
    )
    prior_attempts = state.get("stage_attempts", {}).get("backend", 0)
    prompt = f"""You are a senior {framework} engineer. Generate a coherent backend.
The structured plan and API contract below are authoritative. Implement the contract exactly:
do not add, remove, rename, or change endpoint methods or request/response shapes.
Plan JSON (includes the API contract and all tasks): {json.dumps(plan, ensure_ascii=False, separators=(',', ':'))}
Assigned tasks: {json.dumps(tasks, ensure_ascii=False, separators=(',', ':'))}
Repair findings to resolve: {json.dumps(state.get('repair_feedback', []), ensure_ascii=False)}
Requirements: use {language}, validation, useful errors, environment configuration, and no secrets.
Generate every file in this list: {json.dumps(manifest)}.

Return ONLY file blocks, with no explanation or introduction.
Each file must use this exact format:
FILE: relative/path/to/file
```text
file contents here
```
Rules:
- Start each FILE: declaration on a new line.
- Put the opening triple backticks on the line after the FILE declaration.
- Put the closing triple backticks on a separate line.
- Never leave a block unfinished.
- Keep every file concise so the complete response fits in a single reply; never stop mid-file.
- Never put a FILE: declaration inside another file's code block.
- Generate every file in the required manifest: {json.dumps(manifest)}."""

    last_errors = None
    for attempt in range(MAX_GENERATION_RETRIES + 1):
        save_workflow_log(
            project_id,
            "Backend Dev",
            "Generating backend artifacts",
            run_id=state.get("run_id"),
            stage="backend",
            event="attempt",
            attempt=prior_attempts + attempt + 1,
        )
        retry_prompt = (
            prompt
            if last_errors is None
            else f"{prompt}\nPrevious validation failures to correct: {json.dumps(last_errors)}"
        )
        response = llm.invoke(retry_prompt)
        metadata = getattr(response, "response_metadata", None) or {}
        append_log(
            f"[Backend Agent] Attempt {prior_attempts + attempt + 1}: "
            f"finish_reason={metadata.get('finish_reason')}, "
            f"response_chars={len(response.content or '')}"
        )
        try:
            backend_files = extract_generated_files(response.content or "")
        except FileOutputError as exc:
            last_errors = [{"code": exc.code, "message": exc.details}]
            append_log(
                f"[Backend Agent] Parse failure ({exc.code}): {exc.details} "
                f"Response tail: {(response.content or '')[-300:]!r}"
            )
        else:
            result = validate_manifest(backend_files, stack)
            names = {item["file_name"] for item in backend_files}
            missing_deliverables = sorted({
                path
                for task in tasks
                for path in task.get("deliverable", [])
                if path not in names
            })
            if missing_deliverables:
                result.add(
                    "task_deliverables",
                    False,
                    f"Missing task deliverables: {', '.join(missing_deliverables)}",
                    details={"missing": missing_deliverables},
                )
            if result.passed:
                break
            last_errors = _details(result)
        if attempt == MAX_GENERATION_RETRIES:
            raise FileOutputError(
                "manifest_validation_failed",
                f"Backend output failed after {attempt + 1} attempts: {json.dumps(last_errors)}",
            )

    backend_code = "\n\n".join(
        f"FILE: {item['file_name']}\n{item['content']}" for item in backend_files
    )
    save_workflow_log(
        project_id,
        "Backend Dev",
        f"Generated {len(backend_files)} backend files",
        "completed",
        run_id=state.get("run_id"),
        stage="backend",
        event="end",
        attempt=prior_attempts + attempt + 1,
        duration_seconds=time.monotonic() - stage_started,
        validation_outcomes=result.model_dump(mode="json"),
    )
    append_log(f"[Backend Agent] Generated {len(backend_files)} files for {project_id}.")
    return {
        "backend_code": backend_code,
        "backend_files": backend_files,
        "backend_validation": result.model_dump(mode="json"),
        "backend_tasks_completed": [task["id"] for task in tasks],
        "generated_files": merge_files(
            state.get("generated_files", []),
            [{**item, "file_name": f"backend/{item['file_name']}"} for item in backend_files],
            remove_names=("review.md",),
        ),
        "stage_attempts": {**state.get("stage_attempts", {}), "backend": prior_attempts + attempt + 1},
        "stage_timings": stage_timings(state, "backend", time.monotonic() - stage_started),
        "active_model": "openai/gpt-oss-120b",
    }