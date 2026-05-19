from datetime import datetime

from pymongo import MongoClient

from config.settings import settings


client = MongoClient(settings.MONGO_URI)

db = client["ai_software_team"]


def save_workflow_log(
    project_id: str,
    agent: str,
    message: str,
    status: str = "running"
):

    db.workflow_logs.insert_one({

        "project_id": project_id,

        "agent": agent,

        "message": message,

        "status": status,

        "timestamp": datetime.utcnow()
    })
