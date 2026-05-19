# Import necessary modules
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# Define the database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///todo.db"

# Create the database engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create the session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)