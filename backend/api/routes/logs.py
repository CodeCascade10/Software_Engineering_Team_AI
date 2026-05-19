from fastapi import APIRouter, Depends

from auth.security import verify_token

from database.mongodb import db


router = APIRouter(
    prefix="/logs",
    tags=["Logs"]
)


@router.get("/{project_id}")
async def get_logs(
    project_id: str,
    user=Depends(verify_token)
):

    logs = await db.workflow_logs.find({
        "project_id": project_id
    }).to_list(length=100)

    for log in logs:

        log["_id"] = str(log["_id"])

    return logs