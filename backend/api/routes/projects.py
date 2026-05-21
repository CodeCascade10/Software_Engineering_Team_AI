from datetime import datetime

from fastapi import APIRouter, Depends

from database.mongodb import db

from auth.security import verify_token

from fastapi import APIRouter, Depends

from database.mongodb import db

from auth.security import verify_token


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.post("/create")
async def create_project(
    data: dict,
    user=Depends(verify_token)
):

    project = {
        "user_id": user["user_id"],
        "title": data["title"],
        "prompt": data["prompt"],
        "status": "created",
        "created_at": datetime.utcnow()
    }

    result = await db.projects.insert_one(
        project
    )

    return {
        "message": "Project created",
        "project_id": str(result.inserted_id)
    }

@router.get("/my-projects")

async def get_my_projects(

    current_user: dict = Depends(verify_token)

):

    projects = await db.projects.find(

        {
            "user_id": str(current_user["user_id"])
        }

    ).to_list(length=100)

    for project in projects:

        project["_id"] = str(project["_id"])

    return projects


@router.get("/")
async def get_projects(
    user=Depends(verify_token)
):

    projects = await db.projects.find({
        "user_id": user["user_id"]
    }).to_list(length=100)

    for project in projects:
        project["_id"] = str(project["_id"])

    return projects