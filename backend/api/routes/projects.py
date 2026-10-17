from datetime import datetime
from typing import Literal

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth.security import verify_token
from database.mongodb import db


router = APIRouter(prefix="/projects", tags=["Projects"])


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    prompt: str = Field(min_length=1, max_length=20_000)
    stack: Literal["FastAPI", "MERN"] = "FastAPI"


def serialize_project(project):
    project["_id"] = str(project["_id"])
    return project


@router.post("/create", status_code=201)
async def create_project(data: ProjectCreate, user=Depends(verify_token)):
    project = {
        "user_id": str(user["user_id"]),
        "title": data.title.strip(),
        "prompt": data.prompt.strip(),
        "stack": data.stack,
        "status": "created",
        "generated_files": [],
        "created_at": datetime.utcnow(),
    }
    if not project["title"] or not project["prompt"]:
        raise HTTPException(status_code=422, detail="Project title and prompt are required")

    result = await db.projects.insert_one(project)
    project["_id"] = str(result.inserted_id)
    return {"message": "Project created", "project": project}


@router.get("/my-projects")
async def get_my_projects(user=Depends(verify_token)):
    projects = await db.projects.find(
        {"user_id": str(user["user_id"])},
        {"generated_files": 0, "tasks": 0, "plan_content": 0, "review_feedback": 0},
    ).sort("created_at", -1).to_list(length=100)
    return [serialize_project(project) for project in projects]


@router.get("/")
async def get_projects(user=Depends(verify_token)):
    return await get_my_projects(user)
