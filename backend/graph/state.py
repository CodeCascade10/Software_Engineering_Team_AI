from typing import Any, NotRequired, TypedDict


class GeneratedFile(TypedDict):
    file_name: str
    content: str


class GraphState(TypedDict):
    project_id: str
    run_id: NotRequired[str]
    project_name: str
    project_stack: str
    user_prompt: str
    tasks: NotRequired[list[dict[str, Any]]]
    plan: NotRequired[dict[str, Any]]
    api_contract: NotRequired[list[dict[str, Any]]]
    verdict: NotRequired[str]
    findings: NotRequired[list[dict[str, Any]]]
    validation_results: NotRequired[list[dict[str, Any]]]
    repair_attempts: NotRequired[int]
    repair_targets: NotRequired[list[str]]
    repair_mode: NotRequired[bool]
    repair_feedback: NotRequired[list[dict[str, Any]]]
    stage_attempts: NotRequired[dict[str, int]]
    stage_timings: NotRequired[dict[str, float]]
    task_status: NotRequired[list[dict[str, Any]]]
    validation_passed: NotRequired[bool]
    sandbox_result: NotRequired[dict[str, Any]]
    plan_content: NotRequired[str]
    plan_files: NotRequired[list[GeneratedFile]]
    backend_code: NotRequired[str]
    backend_files: NotRequired[list[GeneratedFile]]
    backend_validation: NotRequired[dict[str, Any]]
    backend_tasks_completed: NotRequired[list[str]]
    frontend_code: NotRequired[str]
    frontend_files: NotRequired[list[GeneratedFile]]
    frontend_validation: NotRequired[dict[str, Any]]
    frontend_tasks_completed: NotRequired[list[str]]
    generated_files: NotRequired[list[GeneratedFile]]
    review_feedback: NotRequired[str]
    review: NotRequired[dict[str, Any]]
    workflow_error: NotRequired[str]
    active_model: NotRequired[str]
    current_agent: NotRequired[str]
    status: NotRequired[str]
