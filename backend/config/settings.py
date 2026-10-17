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

    VALIDATION_SANDBOX_ENABLED = os.getenv("VALIDATION_SANDBOX_ENABLED", "false").lower() in {"1", "true", "yes"}
    ALLOW_SKIPPED_SANDBOX_COMPLETION = os.getenv("ALLOW_SKIPPED_SANDBOX_COMPLETION", "false").lower() in {"1", "true", "yes"}
    SANDBOX_MODE = os.getenv("SANDBOX_MODE", "subprocess").lower()
    SANDBOX_TIMEOUT_SECONDS = int(os.getenv("SANDBOX_TIMEOUT_SECONDS", "90"))
    SANDBOX_OUTPUT_LIMIT_BYTES = int(os.getenv("SANDBOX_OUTPUT_LIMIT_BYTES", "200000"))
    SANDBOX_MEMORY_MB = int(os.getenv("SANDBOX_MEMORY_MB", "768"))
    SANDBOX_CPU_SECONDS = int(os.getenv("SANDBOX_CPU_SECONDS", "60"))
    MAX_REPAIR_ATTEMPTS = int(os.getenv("MAX_REPAIR_ATTEMPTS", "2"))
    WORKFLOW_HEARTBEAT_SECONDS = int(os.getenv("WORKFLOW_HEARTBEAT_SECONDS", "5"))
    WORKFLOW_STALE_AFTER_SECONDS = int(os.getenv("WORKFLOW_STALE_AFTER_SECONDS", "120"))

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
