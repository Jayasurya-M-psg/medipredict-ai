from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# ─── Prediction Schemas ──────────────────────────────────────────────────────

class DiseaseRequest(BaseModel):
    symptoms: List[str] = Field(..., min_items=1, description="List of symptom names")

class DiabetesRequest(BaseModel):
    pregnancies: int = Field(default=0, ge=0)
    glucose: float = Field(..., ge=0, le=300)
    blood_pressure: float = Field(..., ge=0, le=200)
    skin_thickness: float = Field(default=20, ge=0)
    insulin: float = Field(default=79, ge=0)
    bmi: float = Field(..., ge=10, le=70)
    diabetes_pedigree: float = Field(default=0.5, ge=0)
    age: int = Field(..., ge=1, le=120)

class HeartRequest(BaseModel):
    age: int = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1, description="0=Female, 1=Male")
    chest_pain_type: int = Field(..., ge=0, le=3)
    resting_bp: float = Field(..., ge=0, le=250)
    cholesterol: float = Field(..., ge=0, le=600)
    fasting_blood_sugar: int = Field(..., ge=0, le=1)
    resting_ecg: int = Field(..., ge=0, le=2)
    max_heart_rate: float = Field(..., ge=50, le=250)
    exercise_angina: int = Field(..., ge=0, le=1)
    oldpeak: float = Field(default=0.0, ge=0)
    slope: int = Field(default=1, ge=0, le=2)
    ca: int = Field(default=0, ge=0, le=4)
    thal: int = Field(default=2, ge=0, le=3)

class PredictionRecord(BaseModel):
    user_id: str
    prediction_type: str  # "disease", "diabetes", "heart"
    input_data: dict
    result: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
