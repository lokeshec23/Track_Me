from fastapi import APIRouter, Body, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from backend.database import user_collection
from backend.models.user import UserSchema, UserLoginSchema, Token
from backend.utils import get_password_hash, verify_password, create_access_token
from jose import jwt, JWTError

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.post("/register", response_description="Register a user", response_model=UserSchema)
async def register(user: UserSchema = Body(...)):
    user_dict = user.dict()
    user_exists = await user_collection.find_one({"email": user_dict["email"]})
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    user_dict["password"] = get_password_hash(user_dict["password"])
    new_user = await user_collection.insert_one(user_dict)
    created_user = await user_collection.find_one({"_id": new_user.inserted_id})
    return created_user

@router.post("/login", response_description="Login user", response_model=Token)
async def login(user: UserLoginSchema = Body(...)):
    user_record = await user_collection.find_one({"email": user.email})
    if not user_record or not verify_password(user.password, user_record["password"]):
         raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

from backend.models.user import TokenData
from backend.utils import SECRET_KEY, ALGORITHM

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = await user_collection.find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
    return user

