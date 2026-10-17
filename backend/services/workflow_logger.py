import logging
import threading
from datetime import datetime

from pymongo import MongoClient

from config.settings import settings


logger = logging.getLogger(__name__)
_client = None
_failure_counts = {}
_failure_lock = threading.Lock()


def save_workflow_log(
    project_id: str,
    agent: str,
    message: str,
    status: str = "running",
    *,
    run_id: str | None = None,
    stage: str | None = None,
    event: str | None = None,
    attempt: int = 1,
    duration_seconds: float | None = None,
    validation_outcomes: list | None = None,
):
    """Persist progress and authoritative run stage metadata; telemetry remains non-fatal."""
    global _client
    if not settings.MONGO_URI:
        logger.warning("Skipping workflow log because MONGO_URI is not configured")
        if run_id:
            with _failure_lock:
                _failure_counts[run_id] = _failure_counts.get(run_id, 0) + 1
        return False
    now = datetime.utcnow()
    stage = stage or agent.lower().replace(" ", "_")
    event_data = {
        "agent": agent, "stage": stage, "event": event or status,
        "status": status, "message": message, "attempt": attempt, "timestamp": now,
    }
    if duration_seconds is not None:
        event_data["duration_seconds"] = duration_seconds
    if validation_outcomes is not None:
        event_data["validation_outcomes"] = validation_outcomes
    try:
        if _client is None:
            _client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        database = _client.ai_software_team
        database.workflow_logs.insert_one({"project_id": project_id, "run_id": run_id, **event_data})
        if run_id:
            updates = {
                "current_stage": stage,
                "current_agent": agent,
                "heartbeat_at": now,
            }
            if status == "running":
                updates[f"stage_attempts.{stage}"] = attempt
            if duration_seconds is not None:
                updates[f"stage_timings.{stage}"] = duration_seconds
            database.workflow_runs.update_one(
                {"_id": run_id, "status": "running"},
                {"$set": updates, "$push": {"stage_events": event_data}},
            )
        return True
    except Exception:
        logger.exception("Could not persist workflow progress for project %s", project_id)
        if run_id:
            with _failure_lock:
                _failure_counts[run_id] = _failure_counts.get(run_id, 0) + 1
            try:
                _client.ai_software_team.workflow_runs.update_one(
                    {"_id": run_id}, {"$inc": {"telemetry_error_count": 1}}
                )
            except Exception:
                logger.exception("Could not persist telemetry failure count for workflow run %s", run_id)
            try:
                _client.ai_software_team.workflow_runs.update_one(
                    {"_id": run_id}, {"$inc": {"telemetry_errors": 1}}
                )
            except Exception:
                logger.exception("Could not record telemetry failure for workflow run %s", run_id)
        return False


def get_telemetry_failure_count(run_id):
    with _failure_lock:
        return _failure_counts.get(run_id, 0)


def record_telemetry_fallback(run_id, durable_count=0):
    """Persist local fallback errors when log persistence failed in this process."""
    local_count = get_telemetry_failure_count(run_id)
    target = max(int(durable_count or 0), local_count)
    if target <= int(durable_count or 0):
        return target
    global _client
    try:
        if _client is None and settings.MONGO_URI:
            _client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        if _client is not None:
            _client.ai_software_team.workflow_runs.update_one(
                {"_id": run_id}, {"$set": {"telemetry_error_count": target}}
            )
    except Exception:
        logger.exception("Could not persist telemetry fallback count for workflow run %s", run_id)
    return target
