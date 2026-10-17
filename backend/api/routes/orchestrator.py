from fastapi import APIRouter, Depends, status

from api.routes.workflow import start_workflow
from auth.security import verify_token


router = APIRouter(prefix="/workflow", tags=["Workflow"])


@router.post("/run-all/{project_id}", status_code=status.HTTP_202_ACCEPTED)
async def run_everything(
    project_id: str,
    user=Depends(verify_token),
):
    """Backward-compatible alias for the authenticated project workflow."""
    return await start_workflow(project_id, user)
