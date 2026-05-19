from dotenv import load_dotenv
import os

load_dotenv()


class Settings:

    MONGO_URI = os.getenv("MONGO_URI")

    JWT_SECRET = os.getenv("JWT_SECRET")

    ALGORITHM = os.getenv("ALGORITHM")

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
    )

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")


settings = Settings()