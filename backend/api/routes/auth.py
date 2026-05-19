from fastapi import APIRouter, HTTPException

from database.mongodb import db

from auth.password import (
    hash_password,
    verify_password
)

from auth.jwt_handler import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/signup")
async def signup(data: dict):

    existing_user = await db.users.find_one({
        "email": data["email"]
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed_password = hash_password(
        data["password"]
    )

    user_data = {
        "name": data["name"],
        "email": data["email"],
        "password": hashed_password
    }

    await db.users.insert_one(user_data)

    return {
        "message": "User created successfully"
    }


@router.post("/login")
async def login(data: dict):

    user = await db.users.find_one({
        "email": data["email"]
    })

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    valid_password = verify_password(
        data["password"],
        user["password"]
    )

    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "user_id": str(user["_id"]),
        "email": user["email"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }