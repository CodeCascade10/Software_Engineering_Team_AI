from fastapi import APIRouter, Depends

from auth.security import verify_token


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
async def get_current_user(
    user=Depends(verify_token)
):

    return {
        "message": "Protected route working",
        "user": user
    }