from fastapi import APIRouter, Depends
from datetime import datetime

from app.database.mongo import get_mongo_db
from app.utils.auth import get_admin_user

router = APIRouter()

@router.get("/stats")
async def admin_stats(_: dict = Depends(get_admin_user)):
    db = get_mongo_db()
    total_users   = await db.users.count_documents({})
    active_users  = await db.users.count_documents({"is_active": True})
    total_preds   = await db.predictions.count_documents({})
    disease_preds = await db.predictions.count_documents({"prediction_type": "disease"})
    diabetes_preds= await db.predictions.count_documents({"prediction_type": "diabetes"})
    heart_preds   = await db.predictions.count_documents({"prediction_type": "heart"})
    return {
        "users": {"total": total_users, "active": active_users},
        "predictions": {
            "total": total_preds,
            "disease": disease_preds,
            "diabetes": diabetes_preds,
            "heart": heart_preds,
        },
    }

@router.get("/users")
async def list_users(skip: int = 0, limit: int = 20, _: dict = Depends(get_admin_user)):
    db = get_mongo_db()
    cursor = db.users.find({}, {"hashed_password": 0, "_id": 0}).skip(skip).limit(limit)
    users  = await cursor.to_list(length=limit)
    total  = await db.users.count_documents({})
    for u in users:
        if isinstance(u.get("created_at"), datetime):
            u["created_at"] = u["created_at"].isoformat()
    return {"users": users, "total": total}

@router.put("/users/{user_id}/toggle")
async def toggle_user(user_id: str, _: dict = Depends(get_admin_user)):
    db   = get_mongo_db()
    user = await db.users.find_one({"id": user_id})
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    new_status = not user.get("is_active", True)
    await db.users.update_one({"id": user_id}, {"$set": {"is_active": new_status}})
    return {"message": f"User {'activated' if new_status else 'deactivated'}", "is_active": new_status}

@router.get("/recent-predictions")
async def recent_predictions(limit: int = 10, _: dict = Depends(get_admin_user)):
    db     = get_mongo_db()
    cursor = db.predictions.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    recs   = await cursor.to_list(length=limit)
    for r in recs:
        if isinstance(r.get("created_at"), datetime):
            r["created_at"] = r["created_at"].isoformat()
    return {"records": recs}
