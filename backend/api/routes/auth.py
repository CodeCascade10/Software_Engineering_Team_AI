from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from pymongo.errors import PyMongoError
import re

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


class SignupData(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class LoginData(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


@router.post("/signup")
async def signup(data: SignupData):

    email = str(data.email).strip().lower()

    try:
        existing_user = await db.users.find_one({
            "email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}
        })
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Account service is temporarily unavailable") from exc

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed_password = hash_password(data.password)

    user_data = {
        "name": data.name.strip(),
        "email": email,
        "password": hashed_password
    }

    try:
        await db.users.insert_one(user_data)
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Account service is temporarily unavailable") from exc

    return {
        "message": "User created successfully"
    }


@router.post("/login")
async def login(data: LoginData):

    email = str(data.email).strip().lower()

    try:
        user = await db.users.find_one({
            "email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}
        })
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Account service is temporarily unavailable") from exc

    if (
        not user
        or not user.get("password")
        or not verify_password(data.password, user["password"])
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "user_id": str(user["_id"]),
        "email": user["email"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
