# Durable four-agent workflow

Authenticated requests enqueue a durable workflow_runs record. The FastAPI lifespan worker claims queued records, updates heartbeats, runs the LangGraph pipeline, and persists the graph's terminal state. This queue does not persist LangGraph checkpoints: after a process crash, partial graph state and in-memory generated artifacts are lost, and the stale run is marked failed with a retryable reason. Retrying creates a new run and restarts at the planner; it does not resume at the last stage. Previously completed project artifacts remain until the next run replaces them.

The pipeline generates backend and frontend artifacts into separate backend/ and frontend/ namespaces, runs manifest and API-contract checks, reviews structured validation evidence, and performs at most MAX_REPAIR_ATTEMPTS repair iterations. It reports completed only on mandatory validation success and a PASS review; unresolved findings terminate as needs_review.

## Validation sandbox

Set VALIDATION_SANDBOX_ENABLED=true to install dependencies in a temporary project directory and run frontend build plus backend import/startup checks. Generated project code runs only in child processes or a configured Docker container, never in the API process. SANDBOX_MODE=subprocess applies environment allowlisting, CPU/memory limits where supported, wall-clock timeouts, process-group cleanup, and captured-output caps. This mode does not disable network access. SANDBOX_MODE=docker installs dependencies before running build/smoke commands in containers with --network none, resource limits, dropped capabilities, and no inherited application environment.

Defaults: sandbox disabled; subprocess mode; 90-second command timeout; 200,000-byte output cap; 768 MiB memory cap; 60 CPU seconds; two repair attempts; five-second heartbeat; 120-second stale-run threshold. Override with VALIDATION_SANDBOX_ENABLED, SANDBOX_MODE, SANDBOX_TIMEOUT_SECONDS, SANDBOX_OUTPUT_LIMIT_BYTES, SANDBOX_MEMORY_MB, SANDBOX_CPU_SECONDS, MAX_REPAIR_ATTEMPTS, WORKFLOW_HEARTBEAT_SECONDS, and WORKFLOW_STALE_AFTER_SECONDS.

When sandbox validation is disabled, the build result is persisted as skipped, not passed. By default, `ALLOW_SKIPPED_SANDBOX_COMPLETION=false`, so a skipped sandbox blocks `completed`; set it to `true` only when an operator explicitly accepts static checks without an isolated build. Deterministic manifests, syntax, and API-contract checks remain mandatory either way.
