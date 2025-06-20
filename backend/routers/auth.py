from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import jwt
import bcrypt
from datetime import datetime, timedelta
from loguru import logger

router = APIRouter()
security = HTTPBearer()

# In production, use environment variables and a proper user database
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Demo users (in production, use a proper database)
DEMO_USERS = {
    "admin": {
        "username": "admin",
        "hashed_password": bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "role": "admin"
    }
}

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@router.post("/login", response_model=LoginResponse)
async def login(login_request: LoginRequest):
    """Authenticate user and return access token"""
    try:
        user = DEMO_USERS.get(login_request.username)
        
        if not user or not verify_password(login_request.password, user["hashed_password"]):
            raise HTTPException(
                status_code=401,
                detail="Incorrect username or password"
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["username"]},
            expires_delta=access_token_expires
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "username": user["username"],
                "role": user["role"]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/logout")
async def logout(current_user: str = Depends(verify_token)):
    """Logout user (in a real app, you might blacklist the token)"""
    return {"message": "Successfully logged out"}

@router.get("/me")
async def get_current_user(current_user: str = Depends(verify_token)):
    """Get current user information"""
    user = DEMO_USERS.get(current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "username": user["username"],
        "role": user["role"]
    }

@router.post("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: str = Depends(verify_token)
):
    """Change user password"""
    user = DEMO_USERS.get(current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(old_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    # Hash new password
    new_hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Update password (in production, update in database)
    DEMO_USERS[current_user]["hashed_password"] = new_hashed_password
    
    return {"message": "Password changed successfully"}