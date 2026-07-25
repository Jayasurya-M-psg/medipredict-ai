import os
import joblib
import numpy as np
from typing import Dict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

FEATURES = ["pregnancies","glucose","blood_pressure","skin_thickness","insulin","bmi","diabetes_pedigree","age"]

RISK_FACTORS = {
    "glucose > 140": lambda d: d["glucose"] > 140,
    "BMI ≥ 30 (obese)": lambda d: d["bmi"] >= 30,
    "Age > 45": lambda d: d["age"] > 45,
    "High insulin (>200)": lambda d: d["insulin"] > 200,
    "High blood pressure (≥80 diastolic)": lambda d: d["blood_pressure"] >= 80,
}

class DiabetesPredictor:
    def __init__(self):
        self.model = None
        self._load()

    def _load(self):
        try:
            self.model = joblib.load(os.path.join(MODELS_DIR, "diabetes_model.pkl"))
            print("[OK] Diabetes model loaded")
        except FileNotFoundError:
            print("[WARN] Diabetes model not found. Run: python -m app.ml.train_models")

    def predict(self, data: dict) -> Dict:
        if self.model is None:
            raise RuntimeError("Diabetes model not loaded. Run train_models.py first.")

        features = [[data[f] for f in FEATURES]]
        proba = self.model.predict_proba(features)[0]
        risk_score = float(proba[1])
        prediction = int(risk_score >= 0.5)

        # Identify risk factors present
        present_risks = [label for label, fn in RISK_FACTORS.items() if fn(data)]

        if risk_score < 0.30:
            risk_level = "Low"
        elif risk_score < 0.55:
            risk_level = "Moderate"
        elif risk_score < 0.75:
            risk_level = "High"
        else:
            risk_level = "Very High"

        return {
            "prediction": prediction,
            "risk_score": round(risk_score * 100, 2),
            "risk_level": risk_level,
            "has_diabetes_risk": bool(prediction),
            "risk_factors": present_risks,
            "recommendations": _get_diabetes_recommendations(risk_level),
        }

def _get_diabetes_recommendations(level: str) -> list:
    base = ["Monitor blood glucose regularly", "Maintain a balanced diet low in refined sugars"]
    if level in ["Low"]:
        return base + ["Continue healthy lifestyle habits"]
    if level in ["Moderate"]:
        return base + ["Reduce carbohydrate intake", "Exercise at least 30 min/day", "Schedule a checkup with your doctor"]
    return base + ["Consult an Endocrinologist immediately", "Consider HbA1c testing", "Strict diet control required", "Regular physical activity is essential"]

diabetes_predictor = DiabetesPredictor()
