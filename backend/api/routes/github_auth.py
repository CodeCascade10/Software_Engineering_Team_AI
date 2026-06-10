import httpx

from fastapi import APIRouter
from fastapi.responses import RedirectResponse

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

        github_user = (
            user_response.json()
        )

        if "login" not in github_user:

            return {
                "error":
                "GitHub user fetch failed",

                "status_code":
                user_response.status_code,

                "token_response":
                token_data,

                "github_user":
                github_user
            }

        return {
            "success": True,

            "github_user":
            github_user
        }