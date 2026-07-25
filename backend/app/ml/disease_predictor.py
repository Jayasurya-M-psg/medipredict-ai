import os
import joblib
import numpy as np
from typing import List, Dict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

class DiseasePredictor:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.symptom_list = None
        self.disease_list = None
        self._load()

    def _load(self):
        try:
            self.model = joblib.load(os.path.join(MODELS_DIR, "disease_model.pkl"))
            self.label_encoder = joblib.load(os.path.join(MODELS_DIR, "disease_label_encoder.pkl"))
            self.symptom_list = joblib.load(os.path.join(MODELS_DIR, "symptom_list.pkl"))
            self.disease_list = joblib.load(os.path.join(MODELS_DIR, "disease_list.pkl"))
            print("[OK] Disease model loaded")
        except FileNotFoundError:
            print("[WARN] Disease model not found. Run: python -m app.ml.train_models")

    def get_all_symptoms(self) -> List[str]:
        return self.symptom_list or []

    def predict(self, symptoms: List[str]) -> Dict:
        if self.model is None:
            raise RuntimeError("Disease model not loaded. Run train_models.py first.")

        # Build feature vector
        feature_vector = np.zeros(len(self.symptom_list))
        matched = []
        unmatched = []
        for s in symptoms:
            s_clean = s.lower().strip().replace(" ", "_")
            if s_clean in self.symptom_list:
                feature_vector[self.symptom_list.index(s_clean)] = 1
                matched.append(s_clean)
            else:
                unmatched.append(s)

        if not matched:
            raise ValueError("None of the provided symptoms were recognized.")

        # Get probabilities for top-3 predictions
        proba = self.model.predict_proba([feature_vector])[0]
        top_indices = np.argsort(proba)[::-1][:3]

        predictions = []
        for idx in top_indices:
            disease_name = self.label_encoder.inverse_transform([idx])[0]
            confidence = float(proba[idx])
            if confidence > 0.01:
                predictions.append({
                    "disease": disease_name,
                    "confidence": round(confidence * 100, 2),
                    "confidence_raw": confidence,
                })

        return {
            "predictions": predictions,
            "matched_symptoms": matched,
            "unmatched_symptoms": unmatched,
            "top_disease": predictions[0]["disease"] if predictions else None,
            "top_confidence": predictions[0]["confidence"] if predictions else 0,
        }

disease_predictor = DiseasePredictor()
