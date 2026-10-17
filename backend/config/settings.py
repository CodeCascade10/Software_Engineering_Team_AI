from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()
# The OAuth client ID is public frontend configuration. Load it for local
# backend validation while allowing deployments to provide GOOGLE_CLIENT_ID.
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")


class Settings:

    MONGO_URI = os.getenv("MONGO_URI")

    JWT_SECRET = os.getenv("JWT_SECRET")

    ALGORITHM = os.getenv("ALGORITHM")

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    )

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    GITHUB_CLIENT_ID = os.getenv(
    "GITHUB_CLIENT_ID"
    )

    GITHUB_CLIENT_SECRET = os.getenv(
    "GITHUB_CLIENT_SECRET"
    )
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("VITE_GOOGLE_CLIENT_ID")
    FRONTEND_URL = os.getenv(
    "FRONTEND_URL"
    )



settings = Settings()
