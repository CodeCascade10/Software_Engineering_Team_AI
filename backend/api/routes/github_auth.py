import httpx

from fastapi import APIRouter

from fastapi.responses import RedirectResponse

from config.settings import settings

from database.mongodb import db

from auth.jwt_handler import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["GitHub Auth"]
)


@router.get("/github")
async def github_login():

    github_url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
    )

    return RedirectResponse(
        github_url
    )


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

        access_token = (
            token_response.json()
            .get("access_token")
        )

        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization":
                f"Bearer {access_token}"
            },
        )

        github_user = user_response.json()

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
            github_user["login"],

            "email":
            email,

            "provider":
            "github",

            "github_id":
            github_user["id"]
        }

        result = (
            await db.users.insert_one(
                user_data
            )
        )

        user_id = str(
            result.inserted_id
        )

    else:

        user_id = str(
            user["_id"]
        )

    jwt_token = (
        create_access_token(
            {
                "user_id":
                user_id,

                "email":
                email
            }
        )
    )

    frontend_url = (
        "https://software-engineering-team-ai.vercel.app"
        f"/oauth-success?token={jwt_token}"
    )

    return RedirectResponse(
        frontend_url
    )