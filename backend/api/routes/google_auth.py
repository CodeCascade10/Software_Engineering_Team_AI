from fastapi import APIRouter
from database.mongodb import db
from auth.jwt_handler import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Google Auth"]
)

@router.post("/google")
async def google_auth(data: dict):

    print(data)

    email = data.get("email")

    if not email:
        return {
            "received": data,
            "error": "Email not found"
        }

    user = await db.users.find_one(
        {"email": email}
    )

    if not user:

        result = await db.users.insert_one({
            "name": data.get("name"),
            "email": email,
            "provider": "google",
            "google_id": data.get("sub")
        })

        user_id = str(result.inserted_id)

    else:

        user_id = str(user["_id"])

    token = create_access_token({
        "user_id": user_id,
        "email": email
    })

    return {
        "access_token": token
    }