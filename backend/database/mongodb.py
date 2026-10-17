from motor.motor_asyncio import AsyncIOMotorClient

from config.settings import settings


client = AsyncIOMotorClient(
    settings.MONGO_URI,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
)

db = client.ai_software_team
