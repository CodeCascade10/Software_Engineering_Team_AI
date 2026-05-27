from fastapi import APIRouter
from pydantic import BaseModel

from services.reviewer_service import review_code

router = APIRouter()


class ReviewRequest(BaseModel):
    code: str
    language: str


@router.post("/review-code")
async def review_code_route(payload: ReviewRequest):

    result = await review_code(
        code=payload.code,
        language=payload.language
    )

    return result