from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from auth.security import verify_token
from database.mongodb import db


router = APIRouter(prefix="/logs", tags=["Logs"])


@router.get("/{project_id}")
async def get_logs(project_id: str, user=Depends(verify_token)):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    project = await db.projects.find_one(
        {"_id": ObjectId(project_id), "user_id": str(user["user_id"])},
        {"_id": 1, "current_run_id": 1},
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = {"project_id": project_id}
    if project.get("current_run_id"):
        query["run_id"] = project["current_run_id"]
    logs = await db.workflow_logs.find(query).sort("timestamp", 1).to_list(length=100)
    for log in logs:
        log["_id"] = str(log["_id"])
    return logs
