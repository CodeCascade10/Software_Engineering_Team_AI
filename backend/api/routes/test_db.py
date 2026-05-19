from fastapi import APIRouter

from database.mongodb import db


router = APIRouter()


@router.get("/test-db")
async def test_db():

    collections = await db.list_collection_names()

    return {
        "message": "MongoDB Connected Successfully",
        "collections": collections
    }