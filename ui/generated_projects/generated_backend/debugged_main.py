# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional
import os
from models import schemas
from models.utils import create_access_token

# Load environment variables
secret_key = os.environ.get("SECRET_KEY")
algorithm = os.environ.get("ALGORITHM")
access_token_expire_minutes = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES"))

# Create the FastAPI app
app = FastAPI()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Define a dependency to get the current user
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTClaimsError:
        raise HTTPException(
            status_code=401,
            detail="Token has invalid claims",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise credentials_exception
    # Replace with actual user retrieval
    user = {"username": token_data.username, "email": "user@example.com", "full_name": "Full Name", "disabled": False}
    return user

# Example route
@app.get("/items/")
async def read_items(token: str = Depends(oauth2_scheme)):
    return {"message": "Hello, World!"}

# Example route with JWT authentication
@app.post("/token", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Replace with actual user authentication
    user = {"username": form_data.username, "email": "user@example.com", "full_name": "Full Name", "disabled": False}
    access_token_expires = timedelta(minutes=access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Example route with JWT authentication and current user
@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user


# models/schemas.py
from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    username: str
    email: str
    full_name: str
    disabled: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# models/utils.py
import jwt
from datetime import datetime, timedelta
from typing import Optional
import os

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    secret_key = os.environ.get("SECRET_KEY")
    algorithm = os.environ.get("ALGORITHM")
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES")))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt