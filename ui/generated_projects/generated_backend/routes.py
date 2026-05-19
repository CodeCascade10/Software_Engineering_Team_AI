# Import necessary modules
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from auth import get_current_user
from database import SessionLocal
from models import User, Todo

# Create the router
todo_router = APIRouter()
auth_router = APIRouter()

# Define the todo model
class TodoModel(BaseModel):
    title: str
    description: str

# Define the todo response model
class TodoResponseModel(BaseModel):
    id: int
    title: str
    description: str
    done: bool
    created_at: str
    updated_at: str

# Get all todos
@todo_router.get("/todos")
async def get_all_todos(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    todos = db.query(Todo).filter(Todo.user_id == current_user.id).all()
    return [TodoResponseModel(id=todo.id, title=todo.title, description=todo.description, done=todo.done, created_at=todo.created_at, updated_at=todo.updated_at) for todo in todos]

# Create a new todo
@todo_router.post("/todos")
async def create_todo(todo: TodoModel, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    new_todo = Todo(title=todo.title, description=todo.description, user_id=current_user.id)
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return TodoResponseModel(id=new_todo.id, title=new_todo.title, description=new_todo.description, done=new_todo.done, created_at=new_todo.created_at, updated_at=new_todo.updated_at)

# Get a todo by id
@todo_router.get("/todos/{todo_id}")
async def get_todo(todo_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return TodoResponseModel(id=todo.id, title=todo.title, description=todo.description, done=todo.done, created_at=todo.created_at, updated_at=todo.updated_at)

# Update a todo
@todo_router.put("/todos/{todo_id}")
async def update_todo(todo_id: int, todo: TodoModel, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    existing_todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if existing_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    existing_todo.title = todo.title
    existing_todo.description = todo.description
    db.commit()
    db.refresh(existing_todo)
    return TodoResponseModel(id=existing_todo.id, title=existing_todo.title, description=existing_todo.description, done=existing_todo.done, created_at=existing_todo.created_at, updated_at=existing_todo.updated_at)

# Delete a todo
@todo_router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return {"message": "Todo deleted successfully"}

# Create a new user
@auth_router.post("/register")
async def create_user(username: str, full_name: str, email: str, password: str):
    db = SessionLocal()
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user is not None:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = User(username=username, full_name=full_name, email=email, hashed_password=get_password_hash(password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

# Login a user
@auth_router.post("/login")
async def login(username: str, password: str):
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}