from motor.motor_asyncio import AsyncIOMotorClient

from config.settings import settings


client = AsyncIOMotorClient(settings.MONGO_URI)

db = client.ai_software_team