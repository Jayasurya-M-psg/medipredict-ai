import os
import joblib
import numpy as np
from typing import Dict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

FEATURES = ["age","sex","chest_pain_type","resting_bp","cholesterol","fasting_blood_sugar",
            "resting_ecg","max_heart_rate","exercise_angina","oldpeak","slope","ca","thal"]

RISK_FACTORS = {
    "Age > 55": lambda d: d["age"] > 55,
    "High cholesterol (>240)": lambda d: d["cholesterol"] > 240,
    "High resting BP (>130)": lambda d: d["resting_bp"] > 130,
    "Exercise-induced angina": lambda d: d["exercise_angina"] == 1,
    "Asymptomatic chest pain": lambda d: d["chest_pain_type"] == 0,
    "Low max heart rate (<120)": lambda d: d["max_heart_rate"] < 120,
    "Elevated ST depression (>1.5)": lambda d: d["oldpeak"] > 1.5,
    "Positive fasting blood sugar": lambda d: d["fasting_blood_sugar"] == 1,
}

class HeartPredictor:
    def __init__(self):
        self.model = None
        self._load()

    def _load(self):
        try:
            self.model = joblib.load(os.path.join(MODELS_DIR, "heart_model.pkl"))
            print("[OK] Heart disease model loaded")
        except FileNotFoundError:
            print("[WARN] Heart model not found. Run: python -m app.ml.train_models")

    def predict(self, data: dict) -> Dict:
        if self.model is None:
            raise RuntimeError("Heart model not loaded. Run train_models.py first.")

        features = [[data[f] for f in FEATURES]]
        proba = self.model.predict_proba(features)[0]
        risk_score = float(proba[1])
        prediction = int(risk_score >= 0.5)

        present_risks = [label for label, fn in RISK_FACTORS.items() if fn(data)]

        if risk_score < 0.25:
            risk_level = "Low"
        elif risk_score < 0.50:
            risk_level = "Moderate"
        elif risk_score < 0.75:
            risk_level = "High"
        else:
            risk_level = "Very High"

        return {
            "prediction": prediction,
            "risk_score": round(risk_score * 100, 2),
            "risk_level": risk_level,
            "has_heart_risk": bool(prediction),
            "risk_factors": present_risks,
            "recommendations": _get_heart_recommendations(risk_level),
        }

def _get_heart_recommendations(level: str) -> list:
    base = ["Avoid smoking and alcohol", "Maintain healthy weight", "Exercise regularly"]
    if level == "Low":
        return base + ["Continue heart-healthy lifestyle"]
    if level == "Moderate":
        return base + ["Reduce salt and saturated fat", "Monitor blood pressure weekly", "Annual cardiac checkup"]
    return base + ["Consult a Cardiologist immediately", "ECG and stress test recommended", "Consider cholesterol management", "Strict sodium restriction"]

heart_predictor = HeartPredictor()
