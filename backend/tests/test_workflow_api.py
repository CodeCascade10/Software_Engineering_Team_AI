import copy
import asyncio
from types import SimpleNamespace
from datetime import datetime, timedelta

import pytest
from bson import ObjectId
from fastapi import HTTPException

from api.routes import workflow
from services import workflow_logger


def matches(document, query):
    for key, expected in query.items():
        if key == "$or":
            if not any(matches(document, clause) for clause in expected):
                return False
            continue
        value = document.get(key)
        if isinstance(expected, dict):
            for operator, wanted in expected.items():
                if operator == "$nin" and value in wanted: return False
                if operator == "$in" and value not in wanted: return False
                if operator == "$ne" and value == wanted: return False
                if operator == "$lt" and not (value is not None and value < wanted): return False
                if operator == "$exists" and bool(key in document) != wanted: return False
        elif value != expected:
            return False
    return True


class Result:
    def __init__(self, modified_count=0): self.modified_count = modified_count


class Cursor:
    def __init__(self, rows): self.rows = rows
    async def to_list(self, length): return copy.deepcopy(self.rows[:length])


class Collection:
    def __init__(self, documents=()): self.rows = {row["_id"]: copy.deepcopy(row) for row in documents}
    async def create_index(self, *args, **kwargs): return "index"
    async def find_one(self, query, projection=None, **kwargs):
        return copy.deepcopy(next((row for row in self.rows.values() if matches(row, query)), None))
    async def find_one_and_update(self, query, update, return_document=None, **kwargs):
        row = next((row for row in self.rows.values() if matches(row, query)), None)
        if row is None: return None
        before = copy.deepcopy(row)
        self._update(row, update)
        return copy.deepcopy(row if int(return_document or 0) == 1 else before)
    async def insert_one(self, row):
        self.rows[row["_id"]] = copy.deepcopy(row)
        return Result(1)
    async def update_one(self, query, update, **kwargs):
        row = next((row for row in self.rows.values() if matches(row, query)), None)
        if row is None: return Result()
        self._update(row, update)
        return Result(1)
    async def delete_many(self, query):
        for key in [key for key, row in self.rows.items() if matches(row, query)]:
            del self.rows[key]
        return Result()
    def find(self, query):
        return Cursor([row for row in self.rows.values() if matches(row, query)])
    @staticmethod
    def _update(row, update):
        for key, value in update.get("$set", {}).items():
            row[key] = copy.deepcopy(value)
        for key in update.get("$unset", {}):
            row.pop(key, None)
        for key, value in update.get("$inc", {}).items():
            row[key] = row.get(key, 0) + value


class FakeDB:
    def __init__(self, projects=(), runs=()):
        self.projects = Collection(projects)
        self.workflow_runs = Collection(runs)
        self.workflow_logs = Collection()


def make_project(status="created"):
    oid = ObjectId()
    return {"_id": oid, "user_id":"u1", "title":"Demo", "prompt":"Build health", "stack":"FastAPI", "status":status}


@pytest.mark.asyncio
async def test_enqueue_rejects_duplicate_then_supports_cancel_and_retry(monkeypatch):
    project = make_project()
    database = FakeDB([project])
    monkeypatch.setattr(workflow, "db", database)
    first = await workflow.start_workflow(str(project["_id"]), {"user_id":"u1"})
    assert first["status"] == "running"
    with pytest.raises(HTTPException) as duplicate:
        await workflow.start_workflow(str(project["_id"]), {"user_id":"u1"})
    assert duplicate.value.status_code == 409
    cancelled = await workflow.cancel_workflow(str(project["_id"]), {"user_id":"u1"})
    assert cancelled["status"] == "cancelled"
    retry = await workflow.retry_workflow(str(project["_id"]), {"user_id":"u1"})
    assert retry["status"] == "running"
    assert len(database.workflow_runs.rows) == 2


@pytest.mark.asyncio
async def test_terminal_graph_status_and_findings_are_persisted(monkeypatch):
    project = make_project("running")
    run_id = "run-1"
    project["current_run_id"] = run_id
    run = {"_id":run_id,"project_id":str(project["_id"]),"user_id":"u1","status":"running"}
    database = FakeDB([project], [run])
    monkeypatch.setattr(workflow, "db", database)

    class Graph:
        def invoke(self, _):
            return {"status":"needs_review","generated_files":[{"file_name":"review.md","content":"NEEDS_CHANGES"}],
                    "verdict":"NEEDS_CHANGES","findings":[{"severity":"high","description":"Fix required"}],
                    "validation_results":[{"checks":[]}],"validation_passed":False,"repair_attempts":2}
    monkeypatch.setattr(workflow, "build_graph", lambda: Graph())
    monkeypatch.setattr(workflow, "record_telemetry_fallback", lambda *_: 0)
    await workflow.execute_workflow_run(run)
    saved = await database.projects.find_one({"_id":project["_id"]})
    assert saved["status"] == "needs_review"
    assert saved["verdict"] == "NEEDS_CHANGES"
    assert saved["findings"][0]["severity"] == "high"


@pytest.mark.asyncio
async def test_api_demotes_completed_graph_result_with_incomplete_planned_tasks(monkeypatch):
    project = make_project("running")
    run_id = "incomplete-terminal"
    project["current_run_id"] = run_id
    run = {"_id":run_id,"project_id":str(project["_id"]),"user_id":"u1","status":"running"}
    database = FakeDB([project], [run])
    monkeypatch.setattr(workflow, "db", database)

    class Graph:
        def invoke(self, _):
            return {"status":"completed","validation_passed":True,"verdict":"PASS",
                    "tasks":[{"id":"T1"}],"task_status":[{"id":"T1","status":"incomplete"}],"generated_files":[{"file_name":"x","content":"x"}]}
    monkeypatch.setattr(workflow, "build_graph", lambda: Graph())
    monkeypatch.setattr(workflow, "record_telemetry_fallback", lambda *_: 0)
    await workflow.execute_workflow_run(run)
    saved = await database.projects.find_one({"_id":project["_id"]})
    assert saved["status"] == "needs_review"


@pytest.mark.asyncio
async def test_stale_run_is_marked_failed_and_updates_project(monkeypatch):
    project = make_project("running")
    run_id = "stale-run"
    project["current_run_id"] = run_id
    run = {"_id":run_id,"project_id":str(project["_id"]),"user_id":"u1","status":"running","heartbeat_at":datetime.utcnow()-timedelta(hours=1)}
    database = FakeDB([project], [run])
    monkeypatch.setattr(workflow, "db", database)
    assert await workflow.recover_stale_runs() == 1
    failed_run = await database.workflow_runs.find_one({"_id":run_id})
    failed_project = await database.projects.find_one({"_id":project["_id"]})
    assert failed_run["status"] == "failed"
    assert "heartbeat expired" in failed_run["error"]
    assert failed_project["status"] == "failed"
    assert "heartbeat expired" in failed_project["workflow_error"]


@pytest.mark.asyncio
async def test_status_reads_authoritative_run_stage_and_telemetry(monkeypatch):
    project = make_project("running")
    project["current_run_id"] = "run-2"
    run = {"_id":"run-2","status":"running","current_agent":"Frontend Dev","stage":"frontend","telemetry_error_count":1,"stage_attempts":{"frontend":2},"stage_timings":{"frontend":3.4}}
    database = FakeDB([project], [run])
    monkeypatch.setattr(workflow, "db", database)
    result = await workflow.get_workflow_status(str(project["_id"]), {"user_id":"u1"})
    assert result["current_agent"] == "Frontend Dev"
    assert result["telemetry_degraded"] is True
    assert result["stage_attempts"]["frontend"] == 2
    assert database.workflow_logs.rows == {}


@pytest.mark.asyncio
async def test_log_failure_does_not_fail_workflow_and_status_is_degraded(monkeypatch, caplog):
    project = make_project("running")
    run_id = "telemetry-run"
    project["current_run_id"] = run_id
    run = {"_id":run_id,"project_id":str(project["_id"]),"user_id":"u1","status":"running","telemetry_error_count":0}
    database = FakeDB([project], [run])
    monkeypatch.setattr(workflow, "db", database)

    class BadLogs:
        def insert_one(self, _):
            raise RuntimeError("mock log outage")
    class RunsAdapter:
        def update_one(self, query, update):
            row = database.workflow_runs.rows.get(query["_id"])
            if row:
                database.workflow_runs._update(row, update)
    class Client:
        class ai_software_team:
            workflow_logs = BadLogs()
            workflow_runs = RunsAdapter()
    monkeypatch.setattr(workflow_logger.settings, "MONGO_URI", "mongodb://mock-only")
    monkeypatch.setattr(workflow_logger, "_client", Client())
    monkeypatch.setattr(workflow_logger, "_failure_counts", {})

    class Graph:
        def invoke(self, _):
            workflow_logger.save_workflow_log("p", "Planner", "simulated log failure", run_id=run_id)
            task = {"id":"T1","status":"completed"}
            return {"status":"completed","validation_passed":True,"verdict":"PASS","tasks":[task],"task_status":[task],"generated_files":[]}
    monkeypatch.setattr(workflow, "build_graph", lambda: Graph())
    await workflow.execute_workflow_run(run)
    status = await workflow.get_workflow_status(str(project["_id"]), {"user_id":"u1"})
    saved_project = await database.projects.find_one({"_id":project["_id"]})
    assert saved_project["status"] == "completed"
    assert status["telemetry_degraded"] is True
    assert "Could not persist workflow progress" in caplog.text


@pytest.mark.asyncio
async def test_running_cancel_is_cooperative_and_prevents_retry_until_terminal(monkeypatch):
    project = make_project("running")
    project["current_run_id"] = "run-3"
    database = FakeDB([project], [{"_id":"run-3","status":"running"}])
    monkeypatch.setattr(workflow, "db", database)
    result = await workflow.cancel_workflow(str(project["_id"]), {"user_id":"u1"})
    assert result["status"] == "cancelling"
    with pytest.raises(HTTPException) as retry:
        await workflow.retry_workflow(str(project["_id"]), {"user_id":"u1"})
    assert retry.value.status_code == 409


@pytest.mark.asyncio
async def test_worker_claims_and_executes_a_queued_run_at_startup(monkeypatch):
    project = make_project("queued")
    run_id = "queued-run"
    project["current_run_id"] = run_id
    queued = {"_id":run_id,"project_id":str(project["_id"]),"user_id":"u1","status":"queued","created_at":datetime.utcnow(),"heartbeat_at":datetime.utcnow()}
    database = FakeDB([project], [queued])
    monkeypatch.setattr(workflow, "db", database)
    monkeypatch.setattr(workflow, "WORKER_POLL_SECONDS", 0.01)
    executed = asyncio.Event()

    async def fake_execute(run):
        assert run["_id"] == run_id
        await database.workflow_runs.update_one({"_id":run_id}, {"$set":{"status":"completed"}})
        executed.set()

    monkeypatch.setattr(workflow, "execute_workflow_run", fake_execute)
    app = SimpleNamespace(state=SimpleNamespace())
    async with workflow.workflow_lifespan(app):
        await asyncio.wait_for(executed.wait(), timeout=1)
    assert (await database.workflow_runs.find_one({"_id":run_id}))["status"] == "completed"


@pytest.mark.asyncio
async def test_atomic_claim_allows_only_one_worker(monkeypatch):
    project = make_project("queued")
    run = {"_id":"one-job","status":"queued","created_at":datetime.utcnow()}
    database = FakeDB([project], [run])
    monkeypatch.setattr(workflow, "db", database)
    first, second = await asyncio.gather(workflow.claim_next_run("worker-1"), workflow.claim_next_run("worker-2"))
    assert sum(item is not None for item in (first, second)) == 1


@pytest.mark.asyncio
async def test_live_heartbeat_prevents_stale_recovery(monkeypatch):
    project = make_project("running")
    run_id = "heartbeat-run"
    project["current_run_id"] = run_id
    stale_heartbeat = datetime.utcnow() - timedelta(seconds=3)
    run = {"_id":run_id,"status":"running","heartbeat_at":stale_heartbeat}
    database = FakeDB([project], [run])
    monkeypatch.setattr(workflow, "db", database)
    monkeypatch.setattr(workflow.settings, "WORKFLOW_HEARTBEAT_SECONDS", 0.01)
    monkeypatch.setattr(workflow.settings, "WORKFLOW_STALE_AFTER_SECONDS", 1)
    task = asyncio.create_task(workflow._heartbeat(run_id))
    try:
        await asyncio.sleep(0.05)
    finally:
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
    assert await workflow.recover_stale_runs() == 0
    assert (await database.workflow_runs.find_one({"_id":run_id}))["status"] == "running"


@pytest.mark.asyncio
async def test_cancel_finished_run_is_rejected(monkeypatch):
    project = make_project("completed")
    project["current_run_id"] = "done-run"
    database = FakeDB([project], [{"_id":"done-run","status":"completed"}])
    monkeypatch.setattr(workflow, "db", database)
    with pytest.raises(HTTPException) as error:
        await workflow.cancel_workflow(str(project["_id"]), {"user_id":"u1"})
    assert error.value.status_code == 409


@pytest.mark.asyncio
async def test_running_cancel_finishes_cancelled_without_persisting_artifacts(monkeypatch):
    import threading
    project = make_project("running")
    run_id = "cancel-run"
    project["current_run_id"] = run_id
    run = {"_id":run_id,"project_id":str(project["_id"]),"user_id":"u1","status":"running"}
    database = FakeDB([project], [run])
    monkeypatch.setattr(workflow, "db", database)
    entered, release = threading.Event(), threading.Event()

    class Graph:
        def invoke(self, _):
            entered.set()
            release.wait(timeout=2)
            return {"status":"completed","validation_passed":True,"verdict":"PASS","generated_files":[{"file_name":"secret.py","content":"x"}]}

    monkeypatch.setattr(workflow, "build_graph", lambda: Graph())
    monkeypatch.setattr(workflow, "record_telemetry_fallback", lambda *_: 0)
    task = asyncio.create_task(workflow.execute_workflow_run(run))
    assert await asyncio.to_thread(entered.wait, 1)
    cancel = await workflow.cancel_workflow(str(project["_id"]), {"user_id":"u1"})
    assert cancel["status"] == "cancelling"
    release.set()
    await task
    saved_run = await database.workflow_runs.find_one({"_id":run_id})
    saved_project = await database.projects.find_one({"_id":project["_id"]})
    assert saved_run["status"] == "cancelled"
    assert saved_project["status"] == "cancelled"
    assert "generated_files" not in saved_project
