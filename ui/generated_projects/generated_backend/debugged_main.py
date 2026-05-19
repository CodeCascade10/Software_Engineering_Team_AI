Here is the corrected code:

**main.py**

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base
from routes import todo_router, auth_router

app = FastAPI(
    title="Todo API",
    description="A RESTful API for managing todo items",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todo_router)
app.include_router(auth_router)

@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


**routes.py**

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from auth import get_current_user, get_password_hash
from database import get_db
from models import User, Todo
from typing import List

todo_router = APIRouter()
auth_router = APIRouter()

class TodoModel(BaseModel):
    title: str
    description: str

class TodoResponseModel(BaseModel):
    id: int
    title: str
    description: str
    done: bool
    created_at: str
    updated_at: str

@todo_router.get("/todos")
async def get_all_todos(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    todos = db.query(Todo).filter(Todo.user_id == current_user.id).all()
    return [TodoResponseModel(id=todo.id, title=todo.title, description=todo.description, done=todo.done, created_at=str(todo.created_at), updated_at=str(todo.updated_at)) for todo in todos]

@todo_router.post("/todos")
async def create_todo(todo: TodoModel, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_todo = Todo(title=todo.title, description=todo.description, user_id=current_user.id)
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return TodoResponseModel(id=new_todo.id, title=new_todo.title, description=new_todo.description, done=new_todo.done, created_at=str(new_todo.created_at), updated_at=str(new_todo.updated_at))

@todo_router.get("/todos/{todo_id}")
async def get_todo(todo_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return TodoResponseModel(id=todo.id, title=todo.title, description=todo.description, done=todo.done, created_at=str(todo.created_at), updated_at=str(todo.updated_at))

@todo_router.put("/todos/{todo_id}")
async def update_todo(todo_id: int, todo: TodoModel, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if existing_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    existing_todo.title = todo.title
    existing_todo.description = todo.description
    db.commit()
    db.refresh(existing_todo)
    return TodoResponseModel(id=existing_todo.id, title=existing_todo.title, description=existing_todo.description, done=existing_todo.done, created_at=str(existing_todo.created_at), updated_at=str(existing_todo.updated_at))

@todo_router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"message": "Todo deleted successfully"}

@auth_router.post("/register")
async def create_user(username: str, full_name: str, email: str, password: str, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user is not None:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = User(username=username, full_name=full_name, email=email, hashed_password=get_password_hash(password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@auth_router.post("/login")
async def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


**auth.py**

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from database import SessionLocal
from models import User
from datetime import datetime, timedelta
import secrets

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

pwd_context = CryptContext(schemes=["bcrypt"], default="bcrypt")

ACCESS_TOKEN_EXPIRE_MINUTES = 15

SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256"

class UserInDB(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password, salt_rounds=12)

async def authenticate_user(username: str, password: str):
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: int | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    db = SessionLocal()
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user


**database.py**

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from models import Base

SQLALCHEMY_DATABASE_URL = "sqlite:///todo.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


**models.py**

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Todo(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    done = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", backref="todos")


Make sure to install all the required packages by running the following command in your terminal:
bash
pip install fastapi uvicorn sqlalchemy passlib cryptography pydantic


After making these changes, you should be able to run the application using the following command:
bash
python main.py


Then, you can access the API by going to `http://localhost:8000/docs` in your web browser.

Note: You might need to create a `todo.db` file in the same directory as your `main.py` file for the database to work correctly. You can do this by running the following command:
bash
touch todo.db


Alternatively, you can use a different database URL in your `database.py` file to use a different database.