from fastapi import APIRouter

from services.orchestrator import (
    run_full_pipeline,
    workflow_status
)


router = APIRouter(
    prefix="/workflow",
    tags=["Workflow"]
)


@router.post("/run-all/{project_id}")

async def run_everything(project_id: str):

    logs = await run_full_pipeline(project_id)

    return {

        "message": "Full pipeline executed successfully",

        "logs": logs
    }


@router.get("/status/{project_id}")

async def get_workflow_status(project_id: str):

    return workflow_status.get(

        project_id,

        {
            "status": "idle",

            "current_agent": None
        }
    )