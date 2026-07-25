from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.models.prediction import DiseaseRequest, DiabetesRequest, HeartRequest
from app.ml.disease_predictor import disease_predictor
from app.ml.diabetes_predictor import diabetes_predictor
from app.ml.heart_predictor import heart_predictor
from app.database.mongo import get_mongo_db
from app.utils.auth import get_current_user
from app.utils.helpers import get_disease_info

router = APIRouter()

async def save_prediction(db, user_id: str, pred_type: str, input_data: dict, result: dict):
    await db.predictions.insert_one({
        "user_id": user_id,
        "prediction_type": pred_type,
        "input_data": input_data,
        "result": result,
        "created_at": datetime.utcnow(),
    })

@router.get("/symptoms", response_model=dict)
async def get_symptoms():
    """Return the full list of recognizable symptoms."""
    symptoms = disease_predictor.get_all_symptoms()
    return {"symptoms": symptoms, "total": len(symptoms)}

@router.post("/disease", response_model=dict)
async def predict_disease(
    data: DiseaseRequest,
    current_user: dict = Depends(get_current_user),
):
    db = get_mongo_db()
    try:
        result = disease_predictor.predict(data.symptoms)
    except (RuntimeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Enrich with specialist & description info
    for pred in result["predictions"]:
        info = get_disease_info(pred["disease"])
        pred["specialist"] = info["specialist"]
        pred["description"] = info["description"]

    await save_prediction(db, current_user["user_id"], "disease",
                          {"symptoms": data.symptoms}, result)
    return {"success": True, "data": result}

@router.post("/diabetes", response_model=dict)
async def predict_diabetes(
    data: DiabetesRequest,
    current_user: dict = Depends(get_current_user),
):
    db = get_mongo_db()
    try:
        input_dict = data.model_dump()
        result = diabetes_predictor.predict(input_dict)
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    await save_prediction(db, current_user["user_id"], "diabetes", input_dict, result)
    return {"success": True, "data": result}

@router.post("/heart", response_model=dict)
async def predict_heart(
    data: HeartRequest,
    current_user: dict = Depends(get_current_user),
):
    db = get_mongo_db()
    try:
        input_dict = data.model_dump()
        result = heart_predictor.predict(input_dict)
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    await save_prediction(db, current_user["user_id"], "heart", input_dict, result)
    return {"success": True, "data": result}
