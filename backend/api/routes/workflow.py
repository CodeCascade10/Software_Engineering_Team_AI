from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from bson import ObjectId

from database.mongodb import db

from auth.security import verify_token

from graph.builder import build_graph


router = APIRouter(
    prefix="/workflow",
    tags=["Workflow"]
)


@router.post("/start/{project_id}")
async def start_workflow(
    project_id: str,
    user=Depends(verify_token)
):

    print("STEP 1")

    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "user_id": user["user_id"]
    })

    print("STEP 2")

    if not project:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    print("STEP 3")

    workflow = build_graph()

    print("STEP 4")

    initial_state = {

    "project_id": project_id,

    "project_name": project["title"],

    "user_prompt": project["prompt"],

    "messages": [],

    "generated_files": [],

    "review_feedback": "",

    "current_agent": "",

    "status": "running"
}

    print("STEP 5")

    result = workflow.invoke(initial_state)

    print("STEP 6")

    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.utcnow(),
                "result": str(result)
            }
        }
    )

    print("STEP 7")

    return {
        "message": "Workflow executed successfully"
    }