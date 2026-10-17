import asyncio
import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from auth.security import verify_token
from config.settings import settings
from database.mongodb import db
from graph.builder import MAX_REPAIR_ATTEMPTS, build_graph
from services.workflow_logger import record_telemetry_fallback, save_workflow_log


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workflow", tags=["Workflow"])
WORKER_POLL_SECONDS = 1


def valid_project_id(project_id: str) -> ObjectId:
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return ObjectId(project_id)


async def _heartbeat(run_id):
    while True:
        await asyncio.sleep(settings.WORKFLOW_HEARTBEAT_SECONDS)
        await db.workflow_runs.update_one(
            {"_id": run_id, "status": "running"},
            {"$set": {"heartbeat_at": datetime.utcnow()}},
        )


async def execute_workflow_run(run):
    run_id = run["_id"]
    project_id = run["project_id"]
    project_oid = ObjectId(project_id)
    user_id = run["user_id"]
    heartbeat_task = asyncio.create_task(_heartbeat(run_id))
    try:
        project = await db.projects.find_one({"_id": project_oid, "user_id": user_id})
        if not project:
            raise RuntimeError("Project no longer exists or is not owned by the workflow user")
        await db.projects.update_one(
            {"_id": project_oid, "user_id": user_id, "current_run_id": run_id, "status": "queued"},
            {"$set": {"status": "running"}},
        )
        initial_state = {
            "project_id": project_id,
            "run_id": run_id,
            "project_name": project["title"],
            "project_stack": project.get("stack", "FastAPI"),
            "user_prompt": project["prompt"],
            "generated_files": [],
            "status": "running",
            "repair_attempts": 0,
            "stage_attempts": {},
            "stage_timings": {},
        }
        result = await asyncio.to_thread(build_graph().invoke, initial_state)
        current_run = await db.workflow_runs.find_one({"_id": run_id})
        if not current_run or current_run.get("status") != "running":
            return
        if current_run and current_run.get("cancel_requested"):
            await db.workflow_runs.update_one({"_id": run_id}, {"$set": {"status": "cancelled", "stage": "cancelled", "finished_at": datetime.utcnow()}})
            await db.projects.update_one(
                {"_id": project_oid, "current_run_id": run_id, "status": "cancelling"},
                {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}},
            )
            return

        terminal_status = result.get("status")
        if terminal_status not in {"completed", "needs_review", "failed"}:
            raise RuntimeError(f"Graph exited without a valid terminal status: {terminal_status}")
        planned_tasks = result.get("tasks") or result.get("plan", {}).get("tasks", [])
        task_status = result.get("task_status", [])
        all_tasks_complete = bool(planned_tasks) and len(task_status) == len(planned_tasks) and all(
            task.get("status") == "completed" for task in task_status
        )
        if terminal_status == "completed" and (
            not result.get("validation_passed") or result.get("verdict") != "PASS" or not all_tasks_complete
        ):
            terminal_status = "needs_review"
            result["status"] = terminal_status
        fields = {
            "status": terminal_status,
            "generated_files": result.get("generated_files", []),
            "tasks": result.get("tasks", []),
            "task_status": result.get("task_status", []),
            "plan": result.get("plan", {}),
            "plan_content": result.get("plan_content", ""),
            "review_feedback": result.get("review_feedback", ""),
            "verdict": result.get("verdict"),
            "findings": result.get("findings", []),
            "validation_results": result.get("validation_results", []),
            "validation_passed": result.get("validation_passed", False),
            "repair_attempts": result.get("repair_attempts", 0),
            "stage_attempts": result.get("stage_attempts", {}),
            "completed_at": datetime.utcnow(),
            "workflow_error": result.get("workflow_error") if terminal_status == "failed" else None,
        }
        finishing = await db.workflow_runs.update_one(
            {"_id": run_id, "status": "running", "cancel_requested": {"$ne": True}},
            {"$set": {
                "status": "finishing",
                "stage": terminal_status,
                "current_agent": "Completed" if terminal_status == "completed" else "Failed" if terminal_status == "failed" else "Needs review",
                "verdict": result.get("verdict"),
                "findings": result.get("findings", []),
                "validation_results": result.get("validation_results", []),
                "repair_attempts": result.get("repair_attempts", 0),
                "stage_attempts": result.get("stage_attempts", {}),
                "stage_timings": result.get("stage_timings", {}),
                "telemetry_error_count": record_telemetry_fallback(run_id, current_run.get("telemetry_error_count", 0)),
                "finished_at": datetime.utcnow(),
            }},
        )
        if not finishing.modified_count:
            latest = await db.workflow_runs.find_one({"_id": run_id})
            if latest and latest.get("cancel_requested"):
                await db.workflow_runs.update_one({"_id": run_id}, {"$set": {"status": "cancelled", "stage": "cancelled", "finished_at": datetime.utcnow()}})
                await db.projects.update_one(
                    {"_id": project_oid, "current_run_id": run_id, "status": "cancelling"},
                    {"$set": {"status": "cancelled"}},
                )
            return
        project_update = await db.projects.update_one(
            {"_id": project_oid, "user_id": user_id, "current_run_id": run_id, "status": "running"},
            {"$set": fields},
        )
        if not project_update.modified_count:
            await db.workflow_runs.update_one(
                {"_id": run_id, "status": "finishing"},
                {"$set": {"status": "failed", "stage": "failed", "error": "Project state changed while finalizing the workflow."}},
            )
            return
        await db.workflow_runs.update_one(
            {"_id": run_id, "status": "finishing"},
            {"$set": {"status": terminal_status}},
        )
    except Exception as exc:
        logger.exception("Agent workflow failed for project %s", project_id)
        current_run = await db.workflow_runs.find_one({"_id": run_id})
        if current_run and current_run.get("cancel_requested"):
            await db.workflow_runs.update_one({"_id": run_id, "status": "running"}, {"$set": {"status": "cancelled", "stage": "cancelled", "finished_at": datetime.utcnow()}})
            await db.projects.update_one(
                {"_id": project_oid, "current_run_id": run_id, "status": "cancelling"},
                {"$set": {"status": "cancelled"}},
            )
            return
        save_workflow_log(project_id, "System", "Workflow failed; inspect server logs for details", "failed", run_id=run_id, stage="system", event="failure")
        await db.workflow_runs.update_one(
            {"_id": run_id, "status": {"$in": ["running", "queued", "finishing"]}},
            {"$set": {"status": "failed", "stage": "failed", "current_agent": "Failed", "error": str(exc)[:1000], "telemetry_error_count": record_telemetry_fallback(run_id, (current_run or {}).get("telemetry_error_count", 0)), "finished_at": datetime.utcnow()}},
        )
        await db.projects.update_one(
            {"_id": project_oid, "user_id": user_id, "current_run_id": run_id, "status": "running"},
            {"$set": {"status": "failed", "workflow_error": "Agent workflow failed. See run findings and server logs.", "completed_at": datetime.utcnow()}},
        )
    finally:
        heartbeat_task.cancel()
        try:
            await heartbeat_task
        except asyncio.CancelledError:
            pass


async def claim_next_run(worker_id):
    return await db.workflow_runs.find_one_and_update(
        {"status": "queued"},
        {"$set": {"status": "running", "worker_id": worker_id, "stage": "starting", "heartbeat_at": datetime.utcnow(), "started_at": datetime.utcnow()}},
        sort=[("created_at", 1)],
        return_document=ReturnDocument.AFTER,
    )


async def recover_stale_runs():
    cutoff = datetime.utcnow() - timedelta(seconds=settings.WORKFLOW_STALE_AFTER_SECONDS)
    cursor = db.workflow_runs.find({
        "status": {"$in": ["running", "finishing"]},
        "$or": [{"heartbeat_at": {"$lt": cutoff}}, {"heartbeat_at": {"$exists": False}}],
    })
    stale = await cursor.to_list(length=100)
    for run in stale:
        run_id = run["_id"]
        reason = "Workflow worker heartbeat expired; run marked failed and can be retried."
        changed = await db.workflow_runs.update_one(
            {"_id": run_id, "status": run.get("status"), "heartbeat_at": run.get("heartbeat_at")},
            {"$set": {"status": "failed", "stage": "failed", "error": reason, "finished_at": datetime.utcnow()}},
        )
        if changed.modified_count:
            await db.projects.update_one(
                {"current_run_id": run_id, "status": {"$in": ["queued", "running", "cancelling"]}},
                {"$set": {"status": "failed", "workflow_error": reason, "completed_at": datetime.utcnow()}},
            )
    return len(stale)


async def workflow_worker():
    worker_id = str(uuid.uuid4())
    while True:
        try:
            await recover_stale_runs()
            run = await claim_next_run(worker_id)
            if run:
                await execute_workflow_run(run)
            else:
                await asyncio.sleep(WORKER_POLL_SECONDS)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Workflow worker iteration failed")
            await asyncio.sleep(WORKER_POLL_SECONDS)


@asynccontextmanager
async def workflow_lifespan(app):
    await db.workflow_runs.create_index([("status", 1), ("created_at", 1)])
    await recover_stale_runs()
    task = asyncio.create_task(workflow_worker())
    app.state.workflow_worker = task
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


async def _enqueue(project_id, user, *, retry=False):
    oid = valid_project_id(project_id)
    user_id = str(user["user_id"])
    run_id = str(uuid.uuid4())
    allowed = ["failed", "needs_review", "cancelled"] if retry else None
    query = {"_id": oid, "user_id": user_id}
    if allowed:
        query["status"] = {"$in": allowed}
    else:
        query["status"] = {"$nin": ["queued", "running", "cancelling"]}
    project = await db.projects.find_one_and_update(
        query,
        {"$set": {"status": "queued", "current_run_id": run_id, "workflow_error": None}, "$unset": {"completed_at": "", "verdict": "", "findings": "", "validation_results": "", "validation_passed": ""}},
        return_document=ReturnDocument.BEFORE,
    )
    if not project:
        owned = await db.projects.find_one({"_id": oid, "user_id": user_id}, {"_id": 1, "status": 1})
        if not owned:
            raise HTTPException(status_code=404, detail="Project not found")
        raise HTTPException(status_code=409, detail=f"Cannot start workflow while project status is {owned.get('status')}")
    now = datetime.utcnow()
    try:
        await db.workflow_runs.insert_one({
            "_id": run_id, "project_id": project_id, "user_id": user_id,
            "status": "queued", "stage": "queued", "current_agent": "Queued",
            "attempt": 1, "repair_attempts": 0, "telemetry_error_count": 0,
            "created_at": now, "heartbeat_at": now,
        })
        await db.workflow_logs.delete_many({"project_id": project_id})
    except Exception as exc:
        await db.projects.update_one({"_id": oid, "current_run_id": run_id}, {"$set": {"status": "failed", "workflow_error": "Could not queue workflow"}})
        raise HTTPException(status_code=503, detail="Could not queue workflow") from exc
    return {"project_id": project_id, "status": "running", "run_id": run_id}


@router.post("/start/{project_id}", status_code=status.HTTP_202_ACCEPTED)
async def start_workflow(project_id: str, user=Depends(verify_token)):
    return await _enqueue(project_id, user)


@router.post("/{project_id}/retry", status_code=status.HTTP_202_ACCEPTED)
async def retry_workflow(project_id: str, user=Depends(verify_token)):
    return await _enqueue(project_id, user, retry=True)


@router.post("/{project_id}/cancel")
async def cancel_workflow(project_id: str, user=Depends(verify_token)):
    oid = valid_project_id(project_id)
    project = await db.projects.find_one({"_id": oid, "user_id": str(user["user_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    run_id = project.get("current_run_id")
    if not run_id:
        raise HTTPException(status_code=409, detail="Project has no active workflow")
    run = await db.workflow_runs.find_one({"_id": run_id})
    if not run or run.get("status") not in {"queued", "running"}:
        raise HTTPException(status_code=409, detail="Workflow is not active")
    if run["status"] == "queued":
        changed = await db.workflow_runs.update_one({"_id": run_id, "status": "queued"}, {"$set": {"status": "cancelled", "stage": "cancelled", "finished_at": datetime.utcnow()}})
        if changed.modified_count:
            await db.projects.update_one({"_id": oid, "current_run_id": run_id, "status": "queued"}, {"$set": {"status": "cancelled"}})
            return {"project_id": project_id, "run_id": run_id, "status": "cancelled"}
        await db.workflow_runs.update_one({"_id": run_id, "status": "running"}, {"$set": {"cancel_requested": True}})
        await db.projects.update_one({"_id": oid, "current_run_id": run_id, "status": "running"}, {"$set": {"status": "cancelling"}})
        return {"project_id": project_id, "run_id": run_id, "status": "cancelling"}
    await db.workflow_runs.update_one({"_id": run_id, "status": "running"}, {"$set": {"cancel_requested": True}})
    await db.projects.update_one({"_id": oid, "current_run_id": run_id}, {"$set": {"status": "cancelling"}})
    return {"project_id": project_id, "run_id": run_id, "status": "cancelling"}


@router.get("/status/{project_id}")
async def get_workflow_status(project_id: str, user=Depends(verify_token)):
    oid = valid_project_id(project_id)
    project = await db.projects.find_one(
        {"_id": oid, "user_id": str(user["user_id"])},
        {"status": 1, "workflow_error": 1, "current_run_id": 1, "verdict": 1, "findings": 1, "validation_results": 1, "validation_passed": 1, "repair_attempts": 1, "task_status": 1},
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    run = await db.workflow_runs.find_one({"_id": project.get("current_run_id")}) if project.get("current_run_id") else None
    return {
        "status": project.get("status", "created"),
        "current_agent": run.get("current_agent") or run.get("stage") if run else None,
        "error": project.get("workflow_error") or (run.get("error") if run else None),
        "run_id": project.get("current_run_id"),
        "verdict": project.get("verdict"),
        "findings": project.get("findings", []),
        "validation_results": project.get("validation_results", []),
        "validation_passed": project.get("validation_passed"),
        "repair_attempts": project.get("repair_attempts", 0),
        "task_status": project.get("task_status", []),
        "telemetry_degraded": bool(run and (run.get("telemetry_error_count", 0) or run.get("telemetry_errors", 0))),
        "stage": run.get("stage") if run else None,
        "stage_attempts": run.get("stage_attempts", {}) if run else {},
        "stage_timings": run.get("stage_timings", {}) if run else {},
    }
