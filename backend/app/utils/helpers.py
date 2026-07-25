from datetime import datetime
from typing import Any, Dict

def success_response(data: Any = None, message: str = "Success") -> Dict:
    return {"status": "success", "message": message, "data": data}

def error_response(message: str = "An error occurred", code: int = 400) -> Dict:
    return {"status": "error", "message": message, "code": code}

def get_risk_level(score: float) -> str:
    if score < 0.30:
        return "Low"
    elif score < 0.60:
        return "Moderate"
    elif score < 0.80:
        return "High"
    else:
        return "Very High"

def get_risk_color(level: str) -> str:
    mapping = {"Low": "#22c55e", "Moderate": "#f59e0b", "High": "#f97316", "Very High": "#ef4444"}
    return mapping.get(level, "#6b7280")

SPECIALIST_MAP = {
    "Fungal infection": "Dermatologist",
    "Allergy": "Allergist / Immunologist",
    "GERD": "Gastroenterologist",
    "Chronic cholestasis": "Gastroenterologist",
    "Drug Reaction": "General Physician",
    "Peptic ulcer disease": "Gastroenterologist",
    "AIDS": "Infectious Disease Specialist",
    "Diabetes": "Endocrinologist",
    "Gastroenteritis": "Gastroenterologist",
    "Bronchial Asthma": "Pulmonologist",
    "Hypertension": "Cardiologist",
    "Migraine": "Neurologist",
    "Cervical spondylosis": "Orthopedic Specialist",
    "Paralysis (brain hemorrhage)": "Neurologist",
    "Jaundice": "Hepatologist",
    "Malaria": "Infectious Disease Specialist",
    "Chicken pox": "General Physician",
    "Dengue": "Infectious Disease Specialist",
    "Typhoid": "Infectious Disease Specialist",
    "Hepatitis A": "Hepatologist",
    "Hepatitis B": "Hepatologist",
    "Hepatitis C": "Hepatologist",
    "Hepatitis D": "Hepatologist",
    "Hepatitis E": "Hepatologist",
    "Alcoholic hepatitis": "Hepatologist",
    "Tuberculosis": "Pulmonologist",
    "Common Cold": "General Physician",
    "Pneumonia": "Pulmonologist",
    "Dimorphic hemmorhoids(piles)": "Proctologist",
    "Heart attack": "Cardiologist",
    "Varicose veins": "Vascular Surgeon",
    "Hypothyroidism": "Endocrinologist",
    "Hyperthyroidism": "Endocrinologist",
    "Hypoglycemia": "Endocrinologist",
    "Osteoarthritis": "Rheumatologist",
    "Arthritis": "Rheumatologist",
    "(vertigo) Paroxysmal Positional Vertigo": "Neurologist",
    "Acne": "Dermatologist",
    "Urinary tract infection": "Urologist",
    "Psoriasis": "Dermatologist",
    "Impetigo": "Dermatologist",
}

DISEASE_DESCRIPTIONS = {
    "Diabetes": "A chronic condition affecting how your body turns food into energy. Requires lifestyle changes and possibly medication.",
    "Hypertension": "High blood pressure that can lead to serious complications. Often manageable with medication and lifestyle changes.",
    "Common Cold": "A viral infection of the upper respiratory tract. Usually resolves on its own within 7-10 days.",
    "Migraine": "A neurological condition causing intense headaches. Often accompanied by nausea, vomiting, and sensitivity to light.",
    "Malaria": "A serious mosquito-borne disease. Requires prompt medical attention and antimalarial treatment.",
    "Dengue": "A viral infection spread by mosquitoes. Requires rest, hydration, and medical monitoring.",
    "Typhoid": "A bacterial infection caused by Salmonella typhi. Requires antibiotic treatment.",
    "Pneumonia": "An infection that inflames air sacs in the lungs. May require antibiotics or antiviral medications.",
    "Tuberculosis": "A bacterial infection primarily affecting the lungs. Requires long-term antibiotic treatment.",
    "Fungal infection": "An infection caused by fungus. Usually treated with antifungal medications.",
}

def get_disease_info(disease: str) -> dict:
    return {
        "specialist": SPECIALIST_MAP.get(disease, "General Physician"),
        "description": DISEASE_DESCRIPTIONS.get(disease, "Please consult a healthcare professional for proper diagnosis and treatment."),
    }

def format_datetime(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S") if dt else None
