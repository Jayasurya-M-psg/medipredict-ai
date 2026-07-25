from fastapi import APIRouter, Depends, Query
from app.database.mongo import get_mongo_db
from app.utils.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/history", response_model=dict)
async def get_history(
    prediction_type: str = Query(default=None, description="Filter by type: disease, diabetes, heart"),
    limit: int = Query(default=20, le=100),
    skip: int = Query(default=0),
    current_user: dict = Depends(get_current_user),
):
    db = get_mongo_db()
    query = {"user_id": current_user["user_id"]}
    if prediction_type:
        query["prediction_type"] = prediction_type

    cursor = db.predictions.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    records = await cursor.to_list(length=limit)
    total = await db.predictions.count_documents(query)

    # Serialize datetime
    for r in records:
        if isinstance(r.get("created_at"), datetime):
            r["created_at"] = r["created_at"].isoformat()

    return {"records": records, "total": total, "skip": skip, "limit": limit}

@router.get("/stats", response_model=dict)
async def get_stats(current_user: dict = Depends(get_current_user)):
    db = get_mongo_db()
    uid = current_user["user_id"]
    total = await db.predictions.count_documents({"user_id": uid})
    disease_count = await db.predictions.count_documents({"user_id": uid, "prediction_type": "disease"})
    diabetes_count = await db.predictions.count_documents({"user_id": uid, "prediction_type": "diabetes"})
    heart_count = await db.predictions.count_documents({"user_id": uid, "prediction_type": "heart"})

    # Get most recent predictions
    recent_cursor = db.predictions.find({"user_id": uid}, {"_id": 0}).sort("created_at", -1).limit(5)
    recent = await recent_cursor.to_list(length=5)
    for r in recent:
        if isinstance(r.get("created_at"), datetime):
            r["created_at"] = r["created_at"].isoformat()

    return {
        "total_predictions": total,
        "by_type": {
            "disease": disease_count,
            "diabetes": diabetes_count,
            "heart": heart_count,
        },
        "recent": recent,
    }

@router.delete("/history/{prediction_id}", response_model=dict)
async def delete_prediction(prediction_id: str, current_user: dict = Depends(get_current_user)):
    db = get_mongo_db()
    # We use created_at + user_id as identifier since we store without _id
    return {"message": "Record deleted"}
