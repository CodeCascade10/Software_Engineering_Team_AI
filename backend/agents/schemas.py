from typing import Literal

from pydantic import BaseModel, Field, model_validator


class ValidationCheck(BaseModel):
    name: str
    passed: bool
    severity: Literal["info", "low", "medium", "high", "critical"] = "high"
    message: str
    details: dict = Field(default_factory=dict)
    status: Literal["passed", "failed", "skipped"] = "passed"
    mandatory: bool = True


class ValidationResult(BaseModel):
    checks: list[ValidationCheck] = Field(default_factory=list)

    @property
    def passed(self) -> bool:
        return all(check.passed for check in self.checks if check.mandatory)

    def add(self, name: str, passed: bool, message: str, *, severity: str = "high", details=None, status=None, mandatory=True):
        self.checks.append(ValidationCheck(
            name=name, passed=passed, severity=severity, message=message, details=details or {},
            status=status or ("passed" if passed else "failed"), mandatory=mandatory,
        ))


class ApiEndpoint(BaseModel):
    method: str
    path: str
    request_schema: dict | str
    response_schema: dict | str
    auth: bool | str
    error_responses: dict
    owner_tasks: list[str]


class PlanTask(BaseModel):
    id: str = Field(pattern=r"^T[0-9]+$")
    owner: Literal["backend", "frontend", "reviewer"]
    deliverable: list[str] = Field(min_length=1)
    dependencies: list[str] = Field(default_factory=list)
    acceptance_criteria: list[str] = Field(min_length=1)


class AgentPlan(BaseModel):
    goals: list[str] = Field(min_length=1)
    architecture_decisions: list[str] = Field(min_length=1)
    api_contract: list[ApiEndpoint] = Field(min_length=1)
    security_constraints: list[str] = Field(min_length=1)
    selected_stack: Literal["FastAPI", "MERN"]
    tasks: list[PlanTask] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_task_graph_and_contract(self):
        task_by_id = {task.id: task for task in self.tasks}
        if len(task_by_id) != len(self.tasks):
            raise ValueError("Task IDs must be unique")
        for section_name, values in (
            ("goals", self.goals),
            ("architecture_decisions", self.architecture_decisions),
            ("security_constraints", self.security_constraints),
        ):
            if any(not value.strip() for value in values):
                raise ValueError(f"{section_name} cannot contain blank entries")
        for task in self.tasks:
            if any(not path.strip() for path in task.deliverable) or any(not item.strip() for item in task.acceptance_criteria):
                raise ValueError(f"Task {task.id} deliverables and acceptance criteria must be nonempty")
            unknown = set(task.dependencies) - set(task_by_id)
            if unknown:
                raise ValueError(f"Task {task.id} has unknown dependencies: {sorted(unknown)}")
        visiting, visited = set(), set()

        def visit(task_id):
            if task_id in visiting:
                raise ValueError("Task dependencies must be acyclic")
            if task_id in visited:
                return
            visiting.add(task_id)
            for dependency in task_by_id[task_id].dependencies:
                visit(dependency)
            visiting.remove(task_id)
            visited.add(task_id)

        for task_id in task_by_id:
            visit(task_id)
        for endpoint in self.api_contract:
            if endpoint.method.upper() not in {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"}:
                raise ValueError(f"Unsupported API method: {endpoint.method}")
            if not endpoint.path.startswith("/") or not endpoint.path.strip():
                raise ValueError(f"API path must be absolute: {endpoint.path}")
            if not endpoint.owner_tasks or set(endpoint.owner_tasks) - set(task_by_id):
                raise ValueError(f"Endpoint {endpoint.method} {endpoint.path} references missing owner tasks")
            owners = {task_by_id[task_id].owner for task_id in endpoint.owner_tasks}
            if "backend" not in owners:
                raise ValueError(f"Endpoint {endpoint.method} {endpoint.path} must have a backend owner task")
        if not any(endpoint.method.upper() == "GET" and endpoint.path == "/health" and endpoint.auth is False for endpoint in self.api_contract):
            raise ValueError("API contract must include an unauthenticated GET /health endpoint for startup validation")
        return self


class ReviewFinding(BaseModel):
    severity: Literal["critical", "high", "medium", "low"]
    file: str
    description: str
    suggested_fix: str
    owner: Literal["backend", "frontend", "both"] | None = None


class CriteriaAssessment(BaseModel):
    task_id: str
    criterion: str
    verified: bool
    notes: str = ""


class ReviewResult(BaseModel):
    verdict: Literal["PASS", "NEEDS_CHANGES"]
    findings: list[ReviewFinding] = Field(default_factory=list)
    summary: str
    verified_acceptance_criteria: list[CriteriaAssessment] = Field(default_factory=list)
