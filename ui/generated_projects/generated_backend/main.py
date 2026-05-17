# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional

# Project Structure:
# main.py
# models/
# schemas.py
# utils.py
# requirements.txt

# Create the FastAPI app
app = FastAPI()

# Define a secret key for JWT
SECRET_KEY = "secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Define a user model
class User(BaseModel):
    username: str
    email: str
    full_name: str
    disabled: bool

# Define a token model
class Token(BaseModel):
    access_token: str
    token_type: str

# Define a token data model
class TokenData(BaseModel):
    username: Optional[str] = None

# Function to create access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Example route
@app.get("/items/")
async def read_items(token: str = Depends(oauth2_scheme)):
    return {"message": "Hello, World!"}

# Example route with JWT authentication
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Replace with actual user authentication
    user = {"username": form_data.username, "email": "user@example.com"}
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Define a dependency to get the current user
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
    user = {"username": token_data.username, "email": "user@example.com"}
    return user

# Example route with JWT authentication and current user
@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user



# models/schemas.py
from pydantic import BaseModel

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

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, "secret_key_here", algorithm="HS256")
    return encoded_jwt


bash
# requirements.txt
fastapi
uvicorn
jose
pydantic

Please install the required packages with `pip install -r requirements.txt` and run the application with `uvicorn main:app --reload`. You can access the API at `http://localhost:8000`.