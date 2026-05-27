from fastapi import FastAPI

from api.routes.test_db import router as test_db_router
from api.routes.auth import router as auth_router
from api.routes.users import router as users_router
from api.routes.projects import router as projects_router
from api.routes.workflow import router as workflow_router
from api.routes.logs import router as logs_router
from fastapi.middleware.cors import CORSMiddleware
from api.routes.files import router as files_router
from api.routes.orchestrator import router as orchestrator_router
from api.routes import agents
from api.routes import reviewer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_db_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(workflow_router)
app.include_router(logs_router)
app.include_router(files_router)
app.include_router(orchestrator_router)
app.include_router( agents.router)
app.include_router(
    reviewer.router,
    prefix="/api",
    tags=["Reviewer"],
)

@app.get("/")
async def root():

    return {
        "message": "AI Software Engineering Team Backend Running"
    }