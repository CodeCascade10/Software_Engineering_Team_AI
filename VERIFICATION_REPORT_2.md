# Verification report 2

**Date:** 17 October 2026  
**Verdict:** PARTIALLY RESOLVED

This report follows the finding IDs in `VERIFICATION_REPORT.md`. The local fake-LLM/fake-DB suite and all ten requested mutations were executed. There are no live-provider or generated-app runtime claims. The workflow correctness gaps in scope were fixed, but the requested seven commits could not be made because `.git` is mounted read-only; therefore the deliverables are not committed and the overall verdict remains partial.

## Scorecard

| Finding | Inspection | Behavioral | Mutation | Overall |
|---|---|---|---|---|
| P1-1 Reviewer verdict controls success | PASS | PASS | PASS (M1, M5) | PASS |
| P1-2 Generated-code validation/build | PASS for static checks and completion guard; runtime build remains unverified | PARTIAL | PASS (M2, M9, M10) | PARTIAL |
| P1-3 Developer agents validate full manifests | PASS | PASS (fixture and per-file cases) | PASS (M3) | PASS |
| P2-1 Structured planner | PASS | PASS | NOT RUN | PARTIAL |
| P2-2 Plan adherence/API contract compatibility | PASS for supported patterns; limits remain below | PASS | PASS (M4) | PASS |
| P2-3 Strict file parser | PASS | PASS | PASS (M6) | PASS |
| P2-4 Durable execution | PASS for durable queue, claims, cancellation and stale-failure behavior; no checkpoint resume | PASS (fake DB worker/lease tests) | PASS (M7) | PARTIAL |
| P3-1 Logging/observability | PASS, including durable counter with local fallback | PASS | PASS (M8) | PASS |
| P3-2 Automated regression tests | PASS | PASS (79 passed, 0 failed, 0 skipped) | PASS (suite caught mutations) | PASS |

**Command and output:**

```text
env -u GROQ_API_KEY -u MONGODB_URI -u MONGO_URI backend/venv/bin/python -m pytest -q
79 passed, 147 warnings in 11.17s
```

All 147 warnings are deprecations (primarily Python 3.14 `datetime.utcnow` and pytest-asyncio event loop policy APIs); none are skips or failures.

## Work completed

- Added a development requirements file, pytest configuration with offline default marker exclusion, and README install/test instructions.
- Added file and line metadata for per-file validation checks, propagated it into findings, and used finding ownership for backend/frontend repair routing.
- Legacy terminal helpers now route command execution through the sandbox and reject shell syntax; the debug agent is not in the active graph. `rg` inspection showed no imports/exposure of these legacy helpers in API routes, graph nodes, or scripts. An AST regression test forbids process/eval primitives outside `services/sandbox.py` (excluding tests and generated code).
- Expanded contract extraction for cross-file FastAPI router prefixes, Express mount prefixes while ignoring comment/string pseudo-routes, template/concatenated frontend URLs, axios base URLs, and unresolved dynamic URL warnings.
- Added FakeLLM/fake-collection coverage for planner dependency validation, reviewer retry exhaustion, manifests, graph repair and task ownership, worker startup claim, atomic lease, cancel/stale behavior, telemetry fallback, and stage events.
- Persisted telemetry failure counts on workflow runs, retaining a local fallback and logging counter-write failures.
- Documented stale-run semantics in `backend/docs/workflow.md`: partial in-memory graph state is lost on a crash; stale work is marked failed; retry starts again at planning; there is no checkpoint resume.
- Tightened graph completion to require at least one planned task with matching completed task status; API finalization independently enforces the same validation/verdict/task requirements.

## Mutation results

All mutations ran in `/tmp/mutation_sandbox`, created from the repository without `.git`, `venv`, or `node_modules`. Tests used the existing venv. Each mutated file was restored from `/tmp/mutation_baseline`; both temporary copies were removed after the run. Results below are assertion failures from the named regression tests, not collection errors.

| ID | Mutation applied | Test(s) that failed as expected | Result |
|---|---|---|---|
| M1 | Forced graph completion irrespective of verdict/tasks, then separately disabled API completed-result demotion | `test_persistent_review_findings_end_needs_review_after_repair_limit`; `test_api_demotes_completed_graph_result_with_incomplete_planned_tasks` (separate API mutation) | CAUGHT |
| M2 | Bypassed the frontend→validate edge | `test_syntax_error_is_named_and_repaired_through_validation` | CAUGHT |
| M3 | Shrunk frontend manifest to `App.jsx` and `package.json` | Frontend manifest and prompt-equals-manifest tests | CAUGHT |
| M4 | Removed contract-check invocation | `test_contract_failure_repairs_and_feedback_reaches_backend_prompt` | CAUGHT |
| M5 | Disabled critical/high reviewer override | `test_reviewer_parses_json_and_overrides_pass_with_critical_finding` | CAUGHT |
| M6 | Returned empty output for malformed file blocks | `test_rejects_entire_response_when_any_block_is_malformed_or_empty` | CAUGHT |
| M7 | Stopped worker heartbeat updates | `test_live_heartbeat_prevents_stale_recovery` | CAUGHT |
| M8 | Silenced telemetry failure logging | `test_workflow_log_failure_is_counted_and_logged_without_live_mongo` | CAUGHT |
| M9 | Made skipped sandbox validation optional | `test_skipped_sandbox_blocks_completion_unless_explicitly_allowed` | CAUGHT |
| M10 | Removed syntax-check `details.file` | `test_python_syntax_finding_names_file_and_routes_to_backend` | CAUGHT |

**Copy cleanup check:** the M1–M10 runner restored every touched source file from the pristine copy after each test. The throwaway baseline and mutation directories were then deleted. Final main-tree status comparison against `/tmp/pre_status.txt` found **no pre-task path missing**.

## Completion-path exploration

- **Skipped validation:** with default settings, sandbox `skipped` is mandatory and validation fails; repair is attempted and the graph cannot complete. Setting `ALLOW_SKIPPED_SANDBOX_COMPLETION=true` explicitly permits the skip, but static manifest/contract checks, PASS verdict, and complete task evidence are still required. Covered by `test_skipped_sandbox_blocks_completion_unless_explicitly_allowed`; M9 was caught.
- **Empty task list:** the graph now returns `needs_review` for a PASS/validation-pass state with no planned tasks. The API also demotes any completed result unless the plan is nonempty and every task has a completed status. Covered by the graph guard test and API incomplete-task persistence test.
- **Empty findings:** an empty findings array alone does not authorize success. Completion also requires validation pass, reviewer verdict PASS, a nonempty planned task list, and one completed status per planned task. Reviewer acceptance criteria without supporting evidence become high findings/incomplete tasks.
- **Reviewer retry exhaustion:** typed reviewer output exhaustion is routed to the failed terminal state; covered by `test_reviewer_output_exhaustion_ends_graph_failed`.
- **Cancellation:** cancellation marks the run cancelled and prevents finalization from persisting generated artifacts; finished-run cancellation is rejected. Covered by worker/API cancellation tests.
- **Stale recovery:** stale jobs become failed, with reason recorded on run and project. Recovery does not transition a stale run to completed. Retry creates a new execution from planning; no partial graph state resumes.
- **API persistence:** a forged graph result marked completed without mandatory validation, PASS verdict, nonempty plan and all completed task statuses is demoted to `needs_review`; covered by `test_api_demotes_completed_graph_result_with_incomplete_planned_tasks`.

## Remaining limitations

- Contract checking is static and intentionally partial. It handles the listed common route/mount/client patterns, but is not a full Python or JavaScript parser. Complex conditional router mounting, arbitrary import aliasing/re-exports, computed expressions, wrapper clients, and runtime-generated URLs may be unresolved. Unresolved dynamic frontend URLs produce low-severity warnings; missing contract endpoints and method mismatches remain errors.
- Sandbox skip can be explicitly allowed by configuration. This setting should only be used where skipped runtime checks are acceptable; the default blocks completion.
- Queue durability is not graph checkpointing. A process crash loses in-memory intermediate state; stale recovery marks the run failed and a user retry begins from the planner.
- Worktree modifications are uncommitted. The repository `.git` directory is read-only in this environment: `git switch -c gap-fixes` failed creating `.git/refs/heads/gap-fixes.lock`. Per the task fallback, a safety copy was made at `/tmp/repo_backup`; original pre-task status was saved in `/tmp/pre_status.txt`. No commits were created, so separate commits A1–A7 remain outstanding.

## Not verified offline

| Check | Verdict | Reason |
|---|---|---|
| Real `npm install` / `npm run build` inside sandbox on generated frontend | NOT VERIFIED | Requires network/package registry and a real generated frontend dependency install. |
| Backend startup smoke test on generated backend | NOT VERIFIED | No real generated backend was launched for this verification. |
| Docker sandbox mode | NOT VERIFIED | Docker-mode execution was not run. |
| Live Groq and live MongoDB | NOT VERIFIED | Explicitly excluded; all tests used fake LLM and mocked DB. |

## Repository state and commits

`git log --oneline -7`:

```text
e6acea6 Fix the login and signup issue
941388e Fix login and signup authentication flows
86fe5bd Redesign the Dsahboard
ef0c232 Fixed login and profile  issue
9057c5d Changed Browser tab title again
b501593 Changed Browser tab title
5e333cd Fixed Google login
```

The requested A1–A7 commits were not created because `.git` is read-only. `git status --short` was captured after verification and still contains the original modified/deleted/untracked work plus this report and gap fixes. Comparing path names with `/tmp/pre_status.txt` found no preexisting path absent; 59 original paths remain, with 6 additional paths. `git diff --check` completed with no output.

## Final statement

**PARTIALLY RESOLVED.** Offline behavior and all ten mutation checks pass, but generated-app/live checks are unverified and the required A1–A7 commits could not be created because the Git metadata is read-only.
