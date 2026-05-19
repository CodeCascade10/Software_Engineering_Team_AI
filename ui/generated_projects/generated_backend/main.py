# Import necessary modules
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import todo_router, auth_router
from database import engine
from models import Base

# Create the FastAPI application
app = FastAPI(
    title="Todo API",
    description="A RESTful API for managing todo items",
    version="1.0.0",
)

# Allow CORS for all domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(todo_router)
app.include_router(auth_router)

# Create database tables
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)