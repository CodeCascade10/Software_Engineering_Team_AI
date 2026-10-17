# Independent verification report

**Date:** 17 October 2026  
**Verdict:** PARTIALLY RESOLVED

This review independently inspected the implementation and ran the checks that were possible without Groq or MongoDB. It did not trust test names or the remediation section in `AGENT_FAULT_REPORT.md`. `pytest` is not installed in the workspace virtualenv, so the baseline suite and its mocked API tests could not be executed. No mutation edits were made: the repository already contains extensive uncommitted changes, and the prescribed `git checkout -- <file>` would discard those changes. Consequently, mutation checks are NOT VERIFIED.

## Graph shape and settings

Current graph: `planner → backend → frontend → validate → reviewer`. The reviewer conditionally goes to `completed`, `repair`, `needs_review`, or `failed`; repair routes to backend and/or frontend based on validation/review findings, then returns through validation and review. Agent exceptions route to `failed`. Terminal graph statuses are `completed`, `needs_review`, and `failed`. The API adds durable queue/run states `queued`, `running`, `finishing`, `cancelling`, and `cancelled`.

Settings read from code: `VALIDATION_SANDBOX_ENABLED=false`, `SANDBOX_MODE=subprocess`, `SANDBOX_TIMEOUT_SECONDS=90`, `SANDBOX_OUTPUT_LIMIT_BYTES=200000`, `SANDBOX_MEMORY_MB=768`, `SANDBOX_CPU_SECONDS=60`, `MAX_REPAIR_ATTEMPTS=2`, `WORKFLOW_HEARTBEAT_SECONDS=5`, and `WORKFLOW_STALE_AFTER_SECONDS=120`.

## Scorecard

| Finding | Severity | Code inspection | Behavioral | Mutation | Overall |
|---|---|---|---|---|---|
| P1-1 Reviewer verdict controls success | P1 | PASS | PARTIAL | NOT VERIFIED | PARTIAL |
| P1-2 Generated-code validation/build | P1 | PARTIAL | PARTIAL | NOT VERIFIED | PARTIAL |
| P1-3 Full developer manifests | P1 | PARTIAL | PARTIAL | NOT VERIFIED | PARTIAL |
| P2-1 Structured planner | P2 | PASS | PARTIAL | NOT VERIFIED | PARTIAL |
| P2-2 Plan adherence/API contract | P2 | PARTIAL | PARTIAL | NOT VERIFIED | PARTIAL |
| P2-3 Strict file parser | P2 | PASS | PARTIAL | NOT VERIFIED | PARTIAL |
| P2-4 Durable execution | P2 | PARTIAL | NOT VERIFIED | NOT VERIFIED | PARTIAL |
| P3-1 Logging/observability | P3 | PARTIAL | NOT VERIFIED | NOT VERIFIED | PARTIAL |
| P3-2 Automated regression tests | P3 | PARTIAL | FAIL | NOT VERIFIED | FAIL |

`PASS` for inspection means the inspected code supports the stated property; it does not imply that every required behavior or mutation test passed. In particular, none of the overall findings meets the task's stricter requirement of PASS on inspection, behavior, and mutation.

## Baseline and repository audit

Commands run from the repository root:

```text
env -u GROQ_API_KEY -u MONGODB_URI -u MONGO_URI backend/venv/bin/python -m pytest -q
/home/kausik/Desktop/ai-software-team/backend/venv/bin/python: No module named pytest
```

Baseline verdict: **FAIL**. No tests ran; pass/fail/skip counts are unavailable. The suite could not be used to establish offline correctness.

```text
wc -l backend/tests/test_agents.py backend/tests/test_graph.py backend/tests/test_tools.py
199 backend/tests/test_agents.py
73 backend/tests/test_graph.py
61 backend/tests/test_tools.py
```

These files contain test functions with assertions, not empty placeholders. Static function-name counts are 12 in `test_agents.py`, 4 in `test_graph.py`, and 5 in `test_tools.py` (parameterized cases expand to more cases at collection time). Other test files are listed in the test inventory below.

```text
rg -n 'BackgroundTasks' backend/
```

No matches were returned. Workflow start now inserts a `workflow_runs` document and the app lifespan starts a worker; `claim_next_run` atomically claims queued work in `backend/api/routes/workflow.py:167-173`.

```text
rg -n '\b(exec|eval)\(|subprocess|os\.system' backend --glob '*.py' --glob '!**/venv/**'
```

Subprocess use is **not confined to the sandbox module**. `backend/tools/terminal_tools.py:8-13,34-44,63-76,130-136` runs Python files, installs requirements, starts the generated FastAPI project, and accepts shell commands. `backend/agents/debug_agent.py:33-58` calls the dependency installer and generated-app launcher. These utilities are not connected to the Planner→Reviewer graph based on repository references, and they do run in child processes rather than in-process. However, they do not use the sandbox's environment allowlist or resource limits; `run_terminal_command` uses `shell=True`. This is a repository-level isolation gap and a risk if those agents are later exposed through an API route.

## Evidence by finding

### P1-1 — Reviewer verdict controls success

**Inspection — PASS.** `backend/agents/reviewer_agent.py:89-110` parses JSON against `ReviewResult`, retries invalid/schema-incomplete responses up to three calls, and raises after exhaustion. Lines 129-137 override a contradictory PASS when high/critical findings exist. There is no reviewer return assigning `status: completed`. `backend/graph/builder.py:83-91` only routes to completed when validation passes, verdict is PASS, and all planned tasks are complete. `backend/api/routes/workflow.py:76-83` checks graph terminal status and defensively demotes completed if validation or verdict is missing; lines 84-99 persist verdict, findings, and validation data. Lines 301-326 return these fields from status.

**Behavior — PARTIAL.** Ran a direct offline fake-LLM graph script (command below): both supported-stack happy paths completed; NEEDS_CHANGES then PASS completed with exactly one repair; persistent NEEDS_CHANGES ended `needs_review` at two repairs; planner exception ended `failed`. Existing code contains a PASS-with-critical test (`test_agents.py:163-178`), but that pytest test was not run. I did not execute a direct invalid-prose reviewer retry/exhaustion or API persistence/status behavior because pytest is unavailable.

**Mutation — NOT VERIFIED.** No source mutation was attempted because restoring with `git checkout` would destroy existing uncommitted changes. The repository currently has a dirty working tree.

### P1-2 — Generated-code validation/build

**Inspection — PARTIAL.** The graph wires `validate` before reviewer and includes bounded repair edges (`backend/graph/builder.py:83-137`). `validation_agent.py:20-40` runs manifests, API checks, and optional sandbox validation; skipped is represented with `status=skipped`, `passed=false`, `mandatory=false`. `backend/services/sandbox.py:49-108` creates a fresh environment allowlist, applies supported POSIX resource limits, caps output, and kills timed-out processes. Generated files are written under `TemporaryDirectory` in `sandbox.py:213-224`; frontend npm build and backend startup probes are launched as subprocesses.

Inspection gap: Python syntax failures are detected by `manifests.py:25-33`, but those checks do not put the filename in `details`; `validation_agent.py:62-70` constructs findings from `details.file`, so the user-facing finding's `file` is empty even though the validation check name contains `python_syntax:<filename>`. Also, the legacy execution helpers in `tools/terminal_tools.py` are outside the sandbox as noted above.

**Behavior — PARTIAL.** Offline direct graph scenarios passed (see commands). The trivial sandbox checks for sleep timeout, parent-secret exclusion, output cap, and disabled/skipped status passed. A direct malformed-Python manifest check failed as expected. I did not run real generated `npm install`, generated `npm run build`, backend startup, or Docker. The required named-filename finding behavior was not verified and code inspection indicates it is deficient.

**Mutation — NOT VERIFIED.** Removing the validation node/edge was not attempted due the dirty working tree.

### P1-3 — Developer agents validate full manifests

**Inspection — PARTIAL.** FastAPI and MERN manifests are declared in `backend/agents/manifests.py:11-17`; the frontend prompt is generated directly from `FRONTEND_MANIFEST` in `frontend_agent.py:31-50`, so prompt/manifest cannot drift at that call site. The manifest currently contains six entries (`index.html`, `App.jsx`, `src/main.jsx`, `src/services/api.js`, `src/pages/Home.jsx`, `package.json`), rather than the five files described in the old report; it includes the Vite `index.html` as an additional required file. Both agents retry invalid/incomplete generation twice and then raise `FileOutputError` (`backend_agent.py:54-75`, `frontend_agent.py:51-72`).

**Behavior — PARTIAL.** The standalone manifest and generation-retry tests exist (`test_manifests.py:38-56`, `test_agents.py:109-160`) but were not run under pytest. Static inspection shows the manifest test removes each required file, but checks empty content for every backend file and only `src/main.jsx` for the frontend. Thus the requested per-file whitespace-only coverage is incomplete. A direct check confirmed malformed Python and an invalid frontend package/scripts setup fail.

**Mutation — NOT VERIFIED.** Frontend manifest shrink mutation not attempted because source has uncommitted changes.

### P2-1 — Structured planner

**Inspection — PASS.** `backend/agents/schemas.py:30-101` defines and validates plan sections, unique task IDs, dependencies and cycles, endpoint owners, supported methods, and required `/health`. `planner_agent.py:19-50` extracts JSON from prose/fences and checks selected stack; lines 97-110 retry with the validation error. Lines 53-69 render a Markdown architecture artifact. The old line-per-task conversion is absent.

**Behavior — PARTIAL.** Existing tests cover prose/fence, missing section, duplicate IDs, cycle, wrong stack, malformed JSON, retry, and exhaustion (`test_agents.py:29-76`), but were not run. They do not separately test unknown dependencies as requested. No mutation was run.

### P2-2 — Plan adherence/API contract compatibility

**Inspection — PARTIAL.** `validation_agent.py:20-24` calls deterministic contract checks after frontend generation; failures are included in validation results and graph findings. `builder.py:16-39,42-48` maps check names/files to repair owners and includes findings as repair feedback. `contract_check.py:16-88` supports FastAPI and Express patterns and flags missing/extra backend routes and frontend method/path mismatches.

Known checker limits: Express extraction is regex-based and can match route-like text in comments/strings; FastAPI router prefixes are detected only from the same file's local assignment (`contract_check.py:25-48`), not `include_router` relationships across modules; frontend calls with dynamic/template-string URLs are not extracted (`contract_check.py:52-64`). Existing tests exercise simple literal examples for both stacks but not contract failures flowing through the graph repair prompt or missing task deliverables by frontend (`test_contract_check.py`, `test_agents.py:135-144`).

**Behavior — PARTIAL.** Standalone manual matching-contract checks passed for the simple FastAPI and MERN fixtures, and the project test file contains missing/extra/wrong-method cases. Pytest was unavailable, so required full behavioral cases were not established.

**Mutation — NOT VERIFIED.** Disabling the contract call in the graph was not attempted.

### P2-3 — Strict file parser

**Inspection — PASS.** `backend/agents/file_output.py:25-43` rejects NULs, backslashes, absolute paths, parent traversal, drive-prefix paths, and empty names; lines 46-70 reject any unmatched `FILE:` declaration, empty content, duplicate normalized names case-insensitively, excessive file count, and excessive content. `FileOutputError` carries a `code` and `details` (`16-22`).

**Behavior — PARTIAL.** Direct script verified valid multi-file parsing, malformed trailing block rejection, and traversal/absolute/drive/backslash/NUL path rejection. Existing tests cover duplicate/case variants and limit errors (`test_file_output.py:15-55`) but pytest could not run. The exact “three valid blocks plus malformed fourth” input and typed size/count exceptions were not run directly.

### P2-4 — Durable execution

**Inspection — PARTIAL.** The workflow uses a Mongo `workflow_runs` collection, queue worker, atomic claim, heartbeat task, startup/periodic stale detection, duplicate-run filter, retry and cancel endpoints (`backend/api/routes/workflow.py:29-35,167-228,231-299`). Stale runs are marked failed with a reason and their project status is updated (`176-195`). It uses a durable queue, not graph checkpoints; worker process failure marks stale jobs failed for retry, not resumed.

**Behavior — NOT VERIFIED.** Mocked API test cases exist (`test_workflow_api.py:87-162`) but could not be run. They do not test startup claiming/executing a preexisting queued run, finished-run cancel rejection, or that stale failure reason is persisted. The fake collection does not model atomic interleavings/leases. No live Mongo was used.

**Mutation — NOT VERIFIED.** Heartbeat suppression mutation not attempted.

### P3-1 — Logging/observability

**Inspection — PARTIAL.** `workflow_logger.py:47-78` catches DB write exceptions, calls `logger.exception`, and counts failures. API status reads `current_agent`, attempts, timings, and degradation from the run record (`workflow.py:310-326`). Agent nodes emit start/attempt/end calls, and end events carry duration in the main workflow modules. However, there is no test that checks Python logging output or that deleting all log rows leaves `current_agent` correct. `_failure_counts` is process-local; durable telemetry counter behavior depends on the Mongo update succeeding.

**Behavior — NOT VERIFIED.** `test_tools.py:44-61` and `test_workflow_api.py:140-150` describe isolated logger/status cases, but not the combined requirement (log failure, workflow completion, status degraded, emitted Python log); pytest could not run. No log deletion behavior was executed.

**Mutation — NOT VERIFIED.** No log DB mutation was attempted.

### P3-2 — Automated regression tests

**Inspection — PARTIAL.** Test files contain substantive assertions. Test inventory: `test_agents.py` 12 functions, `test_graph.py` 4, `test_tools.py` 5, `test_contract_check.py` 4, `test_file_output.py` 4, `test_manifests.py` 3, `test_workflow_api.py` 5. Coverage gaps include reviewer invalid-output exhaustion, complete frontend empty-file coverage, missing task-deliverable-to-graph repair behavior, worker startup claim, cancellation after finished, telemetry logging assertion and current-agent after log deletion, and specified mutation tests.

**Behavior — FAIL.** Required baseline command failed before collection because pytest is missing. No claim is made that the suite passes. No live external services were attempted.

## Additional executed behavior checks

Command (run from repository root):

```text
PYTHONPATH=backend env -u GROQ_API_KEY -u MONGO_URI -u MONGODB_URI backend/venv/bin/python - <<'PY'
# inline assertions: parser multi-file and malformed/unsafe paths; syntax and package checks;
# contract match for FastAPI/MERN; sandbox timeout, secret exclusion, output cap, skipped result
PY
manual parser/validator/sandbox checks: PASS
```

Graph command used `build_graph().invoke` with scripted in-memory FakeLLM responses, stubbed workflow loggers, and `VALIDATION_SANDBOX_ENABLED=False`; no Groq or Mongo calls were made:

```text
happy FastAPI completed PASS
happy MERN completed PASS
repair once completed repairs= 1
repairs exhausted needs_review repairs= 2
planner exception failed Planner failed: offline
```

These are direct executions, not pytest results. The scenarios used the committed test fixture data, but they did not run all required fake-reviewer and API scenarios.

## Evaluation data

`backend/api/routes/workflow.py:84-114,126-138` persists the structured plan, task status, validation results, verdict, findings, repair count, stage attempts, stage timings, and telemetry error count to project/run records. `backend/docs/EVALUATION.md:5-24` describes metric inputs and explicitly says ToolCorrectnessMetric and ArgumentCorrectnessMetric are not applicable. Inspection supports the requested data fields; no completed live DB run was available to verify persistence.

## Not verified

- Pytest collection and suite: pytest is absent; the baseline command reports `No module named pytest`.
- Mutation checks: omitted to preserve preexisting uncommitted work; using `git checkout -- <file>` would erase it.
- Live Groq/MongoDB, Docker mode, generated-project dependency installation/build/startup, and actual DB persistence.
- Full npm install/build inside the sandbox. The repository frontend build was checked previously, but that does not validate arbitrary generated apps.
- Full integration of API status with injected logger failure, queue worker startup claim, and cancellation races.

## Working-tree state

At the start of this verification, `git status --short` already showed extensive modified/deleted/untracked auth, dashboard, workflow, and test files, including `AGENT_FAULT_REPORT.md`; none were created by this verification. I did not revert or overwrite them. This report is the only file created by this verification, but the working tree does **not** contain only this report as changed. A final `git status --short` should therefore still show those preexisting changes plus `?? VERIFICATION_REPORT.md`.

## Final statement

**PARTIALLY RESOLVED.** Direct fake-LLM graph runs and focused parser/validator/sandbox checks support several core fixes. The full offline test suite did not run, mutation checks were unsafe with the preexisting dirty tree, and specific gaps remain: validation findings omit the failing source filename, legacy generated-app execution helpers bypass the sandbox, contract extraction is intentionally lightweight and misses common dynamic/cross-file cases, and several required API/telemetry/worker tests are absent or unexecuted.
