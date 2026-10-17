# Four-Agent Workflow Fault Report

**Review date:** 17 October 2026  
**Scope:** Current four-agent generation path in `backend/agents`, LangGraph wiring, workflow API, output parsing, and existing tests.  
**Method:** Static code review. No live Groq/MongoDB workflow or generated-app runtime was executed in this review. Findings below describe implementation faults; they do not assert that every generated app will fail.

## Executive summary

The project has a real four-stage generation path, but its success criteria are too weak. The planner's output is mostly unstructured, the developers validate filenames rather than usable code, and the reviewer returns a natural-language verdict that cannot affect workflow state. The API then marks the project completed without building or running the generated app. As a result, `completed` currently means “the graph returned some generated artifacts,” not “the requested project works.”

## Findings by severity

### P1 — Workflow success ignores the reviewer verdict

**Evidence:** `backend/agents/reviewer_agent.py:27-30, 40-56` asks the model to return `PASS` or `NEEDS_CHANGES`, but accepts any nonempty text and returns `status: completed` unconditionally. `backend/api/routes/workflow.py:36-55` persists the project as `completed` whenever generated files exist; it does not inspect the verdict.

**Impact:** A review that identifies critical/high defects—or even explicitly says `NEEDS_CHANGES`—still appears successful in the dashboard. There is no fix-and-review loop or failed/review-needed terminal state.

**Recommended correction:** Make reviewer output structured (validated JSON or a schema), parse the verdict, and branch the graph. Only mark the project complete after a passing review and required validation; otherwise return actionable findings or route through a bounded repair loop.

### P1 — Generated code is never built, tested, or executed

**Evidence:** The graph ends immediately after `reviewer` (`backend/graph/builder.py:10-23`). The workflow API treats nonempty `generated_files` as sufficient (`backend/api/routes/workflow.py:36-55`). No build/test/execution node is part of this path.

**Impact:** Syntax errors, missing imports/dependencies, broken frontend/backend contracts, and startup failures can all be persisted as completed artifacts. The LLM reviewer is not evidence that the app runs.

**Recommended correction:** Add a controlled validation stage (at minimum static syntax/dependency checks and frontend build; ideally an isolated, resource-limited sandbox with smoke tests). Record each check result and fail completion when mandatory checks fail. Do not run model-generated code in the API process.

### P1 — Developer agents only check a small subset of requested filenames

**Evidence:** Backend checks only `main.py` + `requirements.txt` or `server.js` + `package.json` (`backend/agents/backend_agent.py:42-56`). Frontend checks only `App.jsx` + `package.json` despite asking for five files (`backend/agents/frontend_agent.py:49-61`).

**Impact:** Required routes, models, database module, Vite entry point, API client, or home page may be absent while the agent reports success. Filename presence also says nothing about valid content.

**Recommended correction:** Define per-stack required-file manifests and validate all required files, nonempty content, package/config syntax, imports, and entry-point relationships before advancing.

### P2 — Planner tasks are not structured tasks and plan quality is unverified

**Evidence:** The planner asks for a Markdown plan and checks only that it is nonempty (`backend/agents/planner_agent.py:21-35`). It stores every nonblank Markdown line as a task (`backend/agents/planner_agent.py:40-45`).

**Impact:** Headings and prose become “tasks”; there are no stable IDs, owners, acceptance criteria, or dependencies. The later agents cannot report task-level completion or prove they followed the plan. Missing required plan sections are accepted.

**Recommended correction:** Require a schema with goals, architecture decisions, API contracts, security constraints, and a task array containing IDs, owner, deliverable, dependencies, and acceptance criteria. Validate schema and stack consistency before continuing.

### P2 — Plan adherence and frontend/backend API compatibility are not checked

**Evidence:** Backend and frontend receive plan/context in their prompts (`backend/agents/backend_agent.py:30-48`, `backend/agents/frontend_agent.py:28-55`), but no code compares generated outputs against the plan or checks endpoint/request/response compatibility.

**Impact:** The agents can independently invent incompatible contracts despite being instructed to align. The reviewer may notice some mismatches, but that is an unstructured LLM opinion, not an enforced check.

**Recommended correction:** Generate an explicit API contract once in the plan, require backend and frontend outputs to conform to it, and validate route/method/schema use with deterministic checks or contract tests.

### P2 — File parser can silently accept partial output and does not reject duplicate paths

**Evidence:** `backend/agents/file_output.py:19-40` skips unsafe/invalid/empty file blocks; it does not detect duplicate normalized filenames. It raises only if no usable files remain or size/count limits are exceeded.

**Impact:** A response with some malformed blocks may be treated as a successful partial generation. Duplicate names can produce ambiguous artifacts in the database/editor; later updates can affect multiple matching entries.

**Recommended correction:** Reject the whole response if any declared block is malformed/unsafe, normalize paths before validation, and fail on duplicate names. Validate the expected manifest after parsing.

### P2 — Workflow execution is in-process and is not durable

**Evidence:** `backend/api/routes/workflow.py:69-90` schedules the graph with FastAPI `BackgroundTasks`.

**Impact:** A server restart or worker termination can interrupt generation after the project has been set to `running`, leaving stale status and no durable job to resume. There is also no persisted graph checkpoint for recovering an individual stage.

**Recommended correction:** Use a durable job queue/worker or persisted LangGraph checkpointing. Add stale-run recovery and explicit retry/cancel semantics.

### P3 — Workflow logs are best-effort, so the UI can lack stage evidence

**Evidence:** `backend/services/workflow_logger.py:19-38` catches database errors and continues. The status endpoint derives `current_agent` from the latest log (`backend/api/routes/workflow.py:103-110`).

**Impact:** Generation can succeed while logs/current-agent information is missing; logs cannot be treated as a complete trajectory for evaluation. Because errors are swallowed, there is no explicit observability degradation signal to the caller.

**Recommended correction:** Store step events through the same durable workflow mechanism as status/checkpoints, or expose a telemetry-degraded field and keep authoritative stage state separately from best-effort logs.

### P3 — No automated agent/graph tests currently protect these contracts

**Evidence:** `backend/tests/test_agents.py`, `backend/tests/test_graph.py`, and `backend/tests/test_tools.py` are each 0 bytes.

**Impact:** There are no committed regression tests for parsing, required-file checks, state handoff, review verdict handling, retries, or failure status. Prior offline mocked checks are useful but are not a maintained test suite.

**Recommended correction:** Add unit tests for each agent/parser and graph tests with a fake LLM, including malformed output, duplicates, missing files, `NEEDS_CHANGES`, model exceptions, and each supported stack.

## Agent-by-agent assessment

| Agent | Current useful behavior | Main fault |
|---|---|---|
| Planner | Uses project prompt and selected stack; returns an architecture artifact. | No structured plan schema or quality/adherence checks; task extraction treats every Markdown line as a task. |
| Backend Dev | Generates stack-specific files and checks a minimal required pair. | Does not validate the rest of the manifest, code syntax, dependencies, or whether endpoints satisfy the plan. |
| Frontend Dev | Receives backend files and is prompted to match the API. | Checks only two of five requested files; no actual contract/build check. |
| Reviewer | Reviews the aggregate artifact set and is instructed not to claim tests ran. | Verdict is unparsed and cannot affect completion; source truncation can omit tail files from review. |

## Evaluation against the six metrics

| Metric | Current support | Why |
|---|---|---|
| PlanQualityMetric | Not measured | Free-form plan; only empty output is rejected. |
| PlanAdherenceMetric | Not measured | No plan-to-artifact comparison or acceptance criteria. |
| ToolCorrectnessMetric | Not applicable to current agents | These four agents call the LLM and emit files; they do not select tools. |
| ArgumentCorrectnessMetric | Not applicable to current agents | There are no agent tool arguments to score. |
| TaskCompletionMetric | Weak proxy only | Workflow completion checks for any artifacts, not user acceptance criteria or runnable output. |
| StepEfficiencyMetric | Not measured | Fixed chain has no trajectory-level step/retry/latency evaluation, though log timestamps may support partial timing when logs exist. |

## Validation limits

This is a static review. It does not establish whether the configured Groq key or MongoDB is reachable, whether a live model will produce valid artifacts, or whether a specific generated project builds. Those require a live workflow and sandboxed app validation. The findings above are based on the present control flow and validation code.

## Remediation status (17 October 2026)

The implementation now addresses the findings above with structured plans and reviews, strict file parsing, stack manifests, deterministic contract checks, validation and bounded repair, durable MongoDB workflow runs, explicit telemetry degradation, and mocked regression tests. See `backend/docs/workflow.md` and `backend/docs/EVALUATION.md` for runtime and metric details.

Verification performed in this workspace:

- Backend source modules compile, `main` imports, and the LangGraph builds.
- Frontend production build succeeds.
- The touched `ProjectCard.jsx` passes ESLint.
- `git diff --check` is clean.

Verification not completed:

- `pytest` could not be run because it is not installed in the existing virtualenv and the configured package index is unreachable from this environment. Tests are present and the development requirements are documented, but this report does not claim that they pass.
- Full frontend ESLint does not pass; it reports 26 existing errors in unrelated modules as well as the `ProjectCard` unused variable, which was fixed. Re-run after addressing the remaining lint errors.
- No live Groq, MongoDB, Docker, or generated-app build/smoke test was run. Sandbox execution is disabled by default.
