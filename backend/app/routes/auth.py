from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import uuid
from app.database.mongo import get_mongo_db
from app.models.prediction import UserRegister, UserLogin, ProfileUpdate
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user
from app.config import settings

router = APIRouter()

def user_to_dict(u: dict) -> dict:
    """Return safe user dict (no password)."""
    return {
        "id":          u.get("_id", u.get("id", "")),
        "full_name":   u.get("full_name", ""),
        "email":       u.get("email", ""),
        "role":        u.get("role", "user"),
        "age":         u.get("age"),
        "gender":      u.get("gender"),
        "blood_group": u.get("blood_group"),
        "phone":       u.get("phone"),
        "is_active":   u.get("is_active", True),
        "created_at":  u.get("created_at", datetime.utcnow()).isoformat()
                       if isinstance(u.get("created_at"), datetime) else u.get("created_at"),
    }

@router.post("/register", status_code=201)
async def register(data: UserRegister):
    db = get_mongo_db()
    # Check duplicate email
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "_id":             user_id,
        "id":              user_id,
        "full_name":       data.full_name,
        "email":           data.email,
        "hashed_password": hash_password(data.password),
        "role":            "user",
        "is_active":       True,
        "created_at":      datetime.utcnow(),
    }
    await db.users.insert_one(user_doc)

    token = create_access_token(
        {"sub": user_id, "email": data.email, "role": "user"},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user_doc)}

@router.post("/login")
async def login(data: UserLogin):
    db = get_mongo_db()
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token(
        {"sub": user["id"], "email": user["email"], "role": user.get("role", "user")},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_mongo_db()
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user_to_dict(user)}

@router.put("/profile")
async def update_profile(data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    db = get_mongo_db()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": current_user["user_id"]}, {"$set": update_data})
    user = await db.users.find_one({"id": current_user["user_id"]})
    return {"message": "Profile updated successfully", "user": user_to_dict(user)}
