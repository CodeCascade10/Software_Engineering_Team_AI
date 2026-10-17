from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth.security import verify_token
from database.mongodb import db


router = APIRouter(prefix="/files", tags=["Files"])


class FileUpdate(BaseModel):
    content: str = Field(max_length=1_500_000)


async def owned_project(project_id: str, user):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    project = await db.projects.find_one(
        {"_id": ObjectId(project_id), "user_id": str(user["user_id"])}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_id}")
async def get_generated_files(project_id: str, user=Depends(verify_token)):
    project = await owned_project(project_id, user)
    return {"files": project.get("generated_files", [])}


@router.put("/{project_id}/{file_name:path}")
async def update_generated_file(
    project_id: str,
    file_name: str,
    payload: FileUpdate,
    user=Depends(verify_token),
):
    project = await owned_project(project_id, user)
    if not any(item.get("file_name") == file_name for item in project.get("generated_files", [])):
        raise HTTPException(status_code=404, detail="Generated file not found")

    await db.projects.update_one(
        {"_id": project["_id"], "user_id": str(user["user_id"])},
        {"$set": {"generated_files.$[file].content": payload.content}},
        array_filters=[{"file.file_name": file_name}],
    )
    return {"message": "File saved", "file_name": file_name}
