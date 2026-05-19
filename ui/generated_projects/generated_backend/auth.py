# Import necessary modules
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from database import SessionLocal
from models import User

# Define the authentication scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Define the password context
pwd_context = CryptContext(schemes=["bcrypt"], default="bcrypt")

# Define the token expire time
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Define the secret key
SECRET_KEY = "secret_key"
ALGORITHM = "HS256"

# Define the user model
class UserInDB(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    hashed_password: str

# Define the token model
class Token(BaseModel):
    access_token: str
    token_type: str

# Define the token data model
class TokenData(BaseModel):
    username: str | None = None

# Verify the password
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Get the password hash
def get_password_hash(password: str):
    return pwd_context.hash(password)

# Authenticate the user
async def authenticate_user(username: str, password: str):
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# Create the access token
def create_access_token(data: dict, expires_delta: int | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = int(datetime.utcnow().timestamp() + expires_delta)
    else:
        expire = int(datetime.utcnow().timestamp() + ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Get the current user
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