import httpx

from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from database.mongodb import db
from auth.jwt_handler import create_access_token

from config.settings import settings


router = APIRouter(
    prefix="/auth",
    tags=["GitHub Auth"]
)


@router.get("/github")
async def github_login():

    github_url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        "&scope=read:user user:email"
    )

    return RedirectResponse(github_url)


@router.get("/github/callback")
async def github_callback(code: str):

    async with httpx.AsyncClient() as client:

        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={
                "Accept": "application/json"
            },
            data={
                "client_id":
                settings.GITHUB_CLIENT_ID,

                "client_secret":
                settings.GITHUB_CLIENT_SECRET,

                "code": code,
            },
        )

        token_data = token_response.json()

        access_token = token_data.get(
            "access_token"
        )

        if not access_token:

            return {
                "error":
                "No access token received",

                "token_response":
                token_data
            }

        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization":
                f"Bearer {access_token}",

                "Accept":
                "application/vnd.github+json",

                "X-GitHub-Api-Version":
                "2022-11-28"
            },
        )

        github_user = user_response.json()

        if "login" not in github_user:

            return {
                "error":
                "GitHub user fetch failed",

                "github_user":
                github_user
            }

    email = github_user.get("email")

    if not email:

        email = (
            f"{github_user['login']}"
            "@github.local"
        )

    user = await db.users.find_one(
        {
            "email": email
        }
    )

    if not user:

        user_data = {

            "name":
            github_user.get(
                "name",
                github_user["login"]
            ),

            "email":
            email,

            "provider":
            "github",

            "github_id":
            github_user["id"]
        }

        result = await db.users.insert_one(
            user_data
        )

        user_id = str(
            result.inserted_id
        )

    else:

        user_id = str(
            user["_id"]
        )

    token = create_access_token(
        {
            "user_id":
            user_id,

            "email":
            email
        }
    )

    return RedirectResponse(
        f"https://software-engineering-team-ai.vercel.app/oauth-success?token={token}"
    )