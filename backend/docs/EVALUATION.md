# Four-agent evaluation data

The generation workflow persists evidence for trajectory and task evaluation, but it does not currently compute numeric benchmark scores. Evaluate outputs against a versioned set of project requests and acceptance criteria; do not treat a reviewer verdict alone as ground truth.

## Metrics supported by persisted data

- **PlanQualityMetric:** read the structured plan on the project/run. Assess goal coverage, architecture consistency, API contract completeness, security constraints, task clarity, and acceptance-criterion testability against the original request.
- **PlanAdherenceMetric:** compare generated backend/frontend deliverables and validation results with the planned tasks and API contract. The reviewer also assesses planned acceptance criteria; its result is recorded in task_status acceptance_criteria reviewer_verified.
- **TaskCompletionMetric:** use task_status for per-task completion and each acceptance criterion's deterministic_checks and reviewer_verified evidence. A task is complete only when all of its criteria have deterministic or reviewer evidence and its declared deliverables exist.
- **StepEfficiencyMetric:** use workflow_runs stage_events, stage_attempts, stage_timings, and repair_attempts to calculate stage latency, total latency, retries, and repair iterations. stage_timings is the latest duration per stage; stage_events retains each attempt's event and duration.

## Metrics that do not apply to these agents

**ToolCorrectnessMetric** and **ArgumentCorrectnessMetric** are not applicable to the current Planner, Backend Dev, Frontend Dev, and Reviewer. They call the language model and produce artifacts; they do not select tools or construct tool-call arguments. If tool use is introduced later, add tool-call traces before evaluating those metrics.

## Important interpretation

completed means deterministic mandatory checks passed, the reviewer returned PASS, and planned task evidence is complete. A configured sandbox build adds stronger build/import/startup evidence. With VALIDATION_SANDBOX_ENABLED=false, that check is recorded as skipped (not passed) and is non-mandatory; static manifest and contract checks still must pass. needs_review preserves artifacts and findings after the repair limit. failed indicates an unrecoverable stage/workflow error.

## Data locations

- Project document: plan, tasks, task_status, validation_results, findings, verdict, repair_attempts, and generated files.
- workflow_runs document: authoritative status/stage, stage_events, stage_attempts, stage_timings, telemetry error count, repair count, verdict, findings, and validation results.
- workflow_logs: user-facing progress events. These are best-effort telemetry; use the run document for authoritative stage and metric state.

Scores, thresholds, and benchmark datasets are intentionally left to the evaluation harness that consumes this persisted data.

The React/Vite manifest intentionally requires six files: the five application files requested by the frontend prompt plus `index.html`, which Vite needs as its browser entry document. The prompt list is generated from that manifest so the two lists stay identical.
