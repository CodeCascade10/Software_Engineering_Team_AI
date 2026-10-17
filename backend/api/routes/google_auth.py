import httpx
from fastapi import APIRouter, HTTPException
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError
import re

from auth.jwt_handler import create_access_token
from config.settings import settings
from database.mongodb import db


router = APIRouter(prefix="/auth", tags=["Google Auth"])
GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"


class GoogleCredential(BaseModel):
    credential: str = Field(min_length=1)


@router.post("/google")
async def google_auth(data: GoogleCredential):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured on the server")

    # Fetch Google's signing keys and validate the ID token locally, including
    # signature, issuer, expiry, and this app's audience.
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(GOOGLE_CERTS_URL)
            response.raise_for_status()
        certs = response.json().get("keys", [])
        token_header = jwt.get_unverified_header(data.credential)
        signing_key = next(
            (key for key in certs if key.get("kid") == token_header.get("kid")),
            None,
        )
        if signing_key is None:
            raise ValueError("Google signing key was not found")
        profile = jwt.decode(
            data.credential,
            signing_key,
            algorithms=["RS256"],
            audience=settings.GOOGLE_CLIENT_ID,
            issuer=["accounts.google.com", "https://accounts.google.com"],
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Google sign-in is temporarily unavailable") from exc
    except (JWTError, StopIteration, ValueError, TypeError) as exc:
        raise HTTPException(status_code=401, detail="Google credential is invalid or expired") from exc

    email = profile.get("email")
    if not email or profile.get("email_verified") is not True:
        raise HTTPException(status_code=401, detail="Google account email is not verified")

    email = email.strip().lower()
    try:
        user = await db.users.find_one({
            "email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}
        })

        if not user:
            result = await db.users.insert_one({
                "name": profile.get("name") or email.split("@", 1)[0],
                "email": email,
                "provider": "google",
                "google_id": profile["sub"],
            })
            user_id = str(result.inserted_id)
        else:
            user_id = str(user["_id"])
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Account service is temporarily unavailable") from exc

    token = create_access_token({"user_id": user_id, "email": email})
    return {"access_token": token, "token_type": "bearer"}
