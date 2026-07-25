"""
MediPredict AI — Model Training Script
Run this once to train and save all 3 ML models.

Usage:
    python -m app.ml.train_models

Datasets used:
    1. Disease Prediction  — Synthetic data based on known symptom-disease patterns
       (Replace with: https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset)
    2. Diabetes Prediction — Pima Indians Diabetes Dataset
       (Replace with: https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database)
    3. Heart Disease       — Cleveland Heart Disease Dataset
       (Replace with: https://www.kaggle.com/datasets/ronitf/heart-disease-uci)
"""

import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
from sklearn.ensemble import GradientBoostingClassifier as XGBClassifier  # Using sklearn GB instead of XGBoost

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)

# ─── Disease → Symptom Mapping ───────────────────────────────────────────────
DISEASE_SYMPTOMS = {
    "Fungal infection":       ["itching","skin_rash","nodal_skin_eruptions","dischromic_patches"],
    "Allergy":                ["continuous_sneezing","shivering","chills","watering_from_eyes","runny_nose"],
    "GERD":                   ["stomach_pain","acidity","ulcers_on_tongue","vomiting","cough","chest_pain"],
    "Chronic cholestasis":    ["itching","vomiting","yellowish_skin","nausea","loss_of_appetite","abdominal_pain","yellowing_of_eyes"],
    "Drug Reaction":          ["itching","skin_rash","stomach_pain","burning_micturition","spotting_urination"],
    "Peptic ulcer disease":   ["vomiting","indigestion","loss_of_appetite","abdominal_pain","passage_of_gases","internal_itching"],
    "AIDS":                   ["muscle_wasting","patches_in_throat","high_fever","extra_marital_contacts","fatigue","weight_loss"],
    "Diabetes":               ["fatigue","weight_loss","restlessness","lethargy","irregular_sugar_level","blurred_and_distorted_vision","excessive_hunger","increased_appetite","polyuria"],
    "Gastroenteritis":        ["vomiting","sunken_eyes","dehydration","diarrhoea","abdominal_pain","nausea"],
    "Bronchial Asthma":       ["fatigue","cough","high_fever","breathlessness","family_history","mucoid_sputum"],
    "Hypertension":           ["headache","chest_pain","dizziness","loss_of_balance","lack_of_concentration"],
    "Migraine":               ["acidity","indigestion","headache","blurred_and_distorted_vision","excessive_hunger","stiff_neck","depression","irritability","visual_disturbances"],
    "Cervical spondylosis":   ["back_pain","weakness_in_limbs","neck_pain","dizziness","loss_of_balance"],
    "Paralysis (brain hemorrhage)": ["vomiting","headache","weakness_of_one_body_side","altered_sensorium"],
    "Jaundice":               ["itching","vomiting","fatigue","weight_loss","high_fever","yellowish_skin","dark_urine","abdominal_pain"],
    "Malaria":                ["chills","vomiting","high_fever","sweating","headache","nausea","muscle_pain","diarrhoea"],
    "Chicken pox":            ["itching","skin_rash","fatigue","lethargy","high_fever","headache","loss_of_appetite","mild_fever","swelled_lymph_nodes","malaise","red_spots_over_body"],
    "Dengue":                 ["skin_rash","chills","joint_pain","vomiting","fatigue","high_fever","headache","nausea","loss_of_appetite","pain_behind_the_eyes","back_pain","malaise","muscle_pain","red_spots_over_body"],
    "Typhoid":                ["chills","vomiting","fatigue","high_fever","headache","nausea","constipation","abdominal_pain","diarrhoea","toxic_look_(typhoid)","belly_pain"],
    "Hepatitis A":            ["joint_pain","vomiting","yellowish_skin","dark_urine","nausea","loss_of_appetite","abdominal_pain","diarrhoea","mild_fever","yellowing_of_eyes","malaise","muscle_pain"],
    "Hepatitis B":            ["itching","fatigue","lethargy","yellowish_skin","dark_urine","loss_of_appetite","abdominal_pain","yellowing_of_eyes","malaise","receiving_blood_transfusion","receiving_unsterile_injections"],
    "Hepatitis C":            ["fatigue","yellowish_skin","nausea","loss_of_appetite","yellowing_of_eyes","family_history"],
    "Hepatitis D":            ["joint_pain","vomiting","fatigue","yellowish_skin","dark_urine","nausea","loss_of_appetite","abdominal_pain","yellowing_of_eyes"],
    "Hepatitis E":            ["joint_pain","vomiting","fatigue","high_fever","yellowish_skin","dark_urine","nausea","loss_of_appetite","abdominal_pain","yellowing_of_eyes","acute_liver_failure","coma","stomach_bleeding"],
    "Alcoholic hepatitis":    ["vomiting","yellowish_skin","abdominal_pain","swelling_of_stomach","distention_of_abdomen","history_of_alcohol_consumption","fluid_overload"],
    "Tuberculosis":           ["chills","vomiting","fatigue","weight_loss","cough","high_fever","breathlessness","sweating","loss_of_appetite","mild_fever","yellowing_of_eyes","swelled_lymph_nodes","malaise","phlegm","blood_in_sputum"],
    "Common Cold":            ["continuous_sneezing","chills","fatigue","cough","headache","runny_nose","congestion","body_ache","loss_of_smell","mild_fever"],
    "Pneumonia":              ["chills","fatigue","cough","high_fever","breathlessness","sweating","malaise","phlegm","blood_in_sputum","rusty_sputum"],
    "Dimorphic hemmorhoids(piles)": ["constipation","pain_during_bowel_motions","pain_in_anal_region","bloody_stool","irritation_in_anus"],
    "Heart attack":           ["vomiting","breathlessness","sweating","chest_pain","fast_heart_rate"],
    "Varicose veins":         ["fatigue","cramps","bruising","obesity","swollen_legs","swollen_blood_vessels","prominent_veins_on_calf"],
    "Hypothyroidism":         ["fatigue","weight_gain","cold_hands_and_feets","mood_swings","lethargy","dizziness","puffy_face_and_eyes","enlarged_thyroid","brittle_nails","swollen_extremeties","depression","irritability","abnormal_menstruation"],
    "Hyperthyroidism":        ["fatigue","mood_swings","weight_loss","restlessness","sweating","diarrhoea","fast_heart_rate","excessive_hunger","muscle_weakness","irritability","abnormal_menstruation"],
    "Hypoglycemia":           ["vomiting","fatigue","anxiety","sweating","headache","nausea","blurred_and_distorted_vision","excessive_hunger","slurred_speech","irritability","palpitations"],
    "Osteoarthritis":         ["joint_pain","neck_pain","knee_pain","hip_joint_pain","swelling_joints","painful_walking"],
    "Arthritis":              ["muscle_weakness","stiff_neck","swelling_joints","movement_stiffness","painful_walking"],
    "(vertigo) Paroxysmal Positional Vertigo": ["vomiting","headache","nausea","spinning_movements","loss_of_balance","unsteadiness"],
    "Acne":                   ["skin_rash","pus_filled_pimples","blackheads","scurring"],
    "Urinary tract infection": ["burning_micturition","bladder_discomfort","foul_smell_of_urine","continuous_feel_of_urine"],
    "Psoriasis":              ["skin_rash","joint_pain","skin_peeling","silver_like_dusting","small_dents_in_nails","inflammatory_nails"],
    "Impetigo":               ["skin_rash","high_fever","blister","red_sore_around_nose","yellow_crust_ooze"],
}

ALL_SYMPTOMS = sorted(set(s for symptoms in DISEASE_SYMPTOMS.values() for s in symptoms))
ALL_DISEASES = sorted(DISEASE_SYMPTOMS.keys())

def generate_disease_dataset(samples_per_disease: int = 120) -> pd.DataFrame:
    """Generate synthetic disease-symptom training data."""
    np.random.seed(42)
    rows = []
    for disease, symptoms in DISEASE_SYMPTOMS.items():
        for _ in range(samples_per_disease):
            row = {s: 0 for s in ALL_SYMPTOMS}
            # Always include core symptoms
            present = list(symptoms)
            # Add 1-2 random symptoms as noise
            extra = np.random.choice([s for s in ALL_SYMPTOMS if s not in symptoms],
                                     size=np.random.randint(0, 3), replace=False)
            for s in present + list(extra):
                if s in row:
                    row[s] = 1
            # Randomly drop 0-1 core symptoms
            if len(present) > 2:
                drop = np.random.choice(present, size=np.random.randint(0, 2), replace=False)
                for s in drop:
                    row[s] = 0
            row["disease"] = disease
            rows.append(row)
    df = pd.DataFrame(rows)
    return df.sample(frac=1, random_state=42).reset_index(drop=True)

def generate_diabetes_dataset(n: int = 800) -> pd.DataFrame:
    """Generate synthetic diabetes dataset similar to Pima Indians."""
    np.random.seed(42)
    diabetic = int(n * 0.35)
    non_diabetic = n - diabetic

    def make_rows(n, diabetic):
        d = 1 if diabetic else 0
        glucose_mean = 148 if diabetic else 109
        bmi_mean = 35 if diabetic else 30
        age_mean = 37 if diabetic else 30
        return {
            "pregnancies": np.random.randint(0, 15, n),
            "glucose": np.clip(np.random.normal(glucose_mean, 25, n), 44, 200),
            "blood_pressure": np.clip(np.random.normal(72, 12, n), 40, 122),
            "skin_thickness": np.clip(np.random.normal(29, 10, n), 7, 60),
            "insulin": np.clip(np.random.normal(155 if diabetic else 68, 80, n), 14, 850),
            "bmi": np.clip(np.random.normal(bmi_mean, 7, n), 18, 67),
            "diabetes_pedigree": np.clip(np.random.exponential(0.5, n), 0.07, 2.4),
            "age": np.clip(np.random.normal(age_mean, 11, n).astype(int), 21, 81),
            "outcome": np.full(n, d),
        }

    df1 = pd.DataFrame(make_rows(diabetic, True))
    df2 = pd.DataFrame(make_rows(non_diabetic, False))
    return pd.concat([df1, df2]).sample(frac=1, random_state=42).reset_index(drop=True)

def generate_heart_dataset(n: int = 600) -> pd.DataFrame:
    """Generate synthetic heart disease dataset similar to Cleveland."""
    np.random.seed(42)
    positive = int(n * 0.46)
    negative = n - positive

    def make_rows(n, has_disease):
        d = 1 if has_disease else 0
        return {
            "age": np.clip(np.random.normal(56 if has_disease else 52, 9, n).astype(int), 29, 77),
            "sex": np.random.choice([0, 1], n, p=[0.25, 0.75]),
            "chest_pain_type": np.random.choice([0,1,2,3], n, p=[0.5,0.2,0.2,0.1] if has_disease else [0.1,0.3,0.4,0.2]),
            "resting_bp": np.clip(np.random.normal(134 if has_disease else 129, 18, n), 94, 200),
            "cholesterol": np.clip(np.random.normal(251, 51, n), 126, 564),
            "fasting_blood_sugar": np.random.choice([0,1], n, p=[0.85, 0.15]),
            "resting_ecg": np.random.choice([0,1,2], n, p=[0.5,0.4,0.1]),
            "max_heart_rate": np.clip(np.random.normal(138 if has_disease else 158, 23, n), 71, 202),
            "exercise_angina": np.random.choice([0,1], n, p=[0.4,0.6] if has_disease else [0.8,0.2]),
            "oldpeak": np.clip(np.random.exponential(1.5 if has_disease else 0.6, n), 0, 6.2),
            "slope": np.random.choice([0,1,2], n, p=[0.3,0.5,0.2] if has_disease else [0.1,0.5,0.4]),
            "ca": np.random.choice([0,1,2,3], n, p=[0.3,0.3,0.2,0.2] if has_disease else [0.6,0.2,0.1,0.1]),
            "thal": np.random.choice([0,1,2,3], n, p=[0.1,0.1,0.4,0.4] if has_disease else [0.1,0.1,0.7,0.1]),
            "target": np.full(n, d),
        }

    df1 = pd.DataFrame(make_rows(positive, True))
    df2 = pd.DataFrame(make_rows(negative, False))
    return pd.concat([df1, df2]).sample(frac=1, random_state=42).reset_index(drop=True)


def train_disease_model():
    print("\n[*] Training Disease Prediction Model...")
    df = generate_disease_dataset(samples_per_disease=120)
    X = df[ALL_SYMPTOMS]
    le = LabelEncoder()
    y = le.fit_transform(df["disease"])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=200, max_depth=None, min_samples_split=2,
                                    random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"   [OK] Disease Model Accuracy: {acc:.4f} ({acc*100:.1f}%)")

    joblib.dump(model, os.path.join(MODELS_DIR, "disease_model.pkl"))
    joblib.dump(le, os.path.join(MODELS_DIR, "disease_label_encoder.pkl"))
    joblib.dump(ALL_SYMPTOMS, os.path.join(MODELS_DIR, "symptom_list.pkl"))
    joblib.dump(ALL_DISEASES, os.path.join(MODELS_DIR, "disease_list.pkl"))
    print("   [SAVED] Disease model saved!")
    return acc

def train_diabetes_model():
    print("\n[*] Training Diabetes Prediction Model...")
    df = generate_diabetes_dataset(800)
    features = ["pregnancies","glucose","blood_pressure","skin_thickness","insulin","bmi","diabetes_pedigree","age"]
    X = df[features]
    y = df["outcome"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = XGBClassifier(n_estimators=150, max_depth=4, learning_rate=0.1, random_state=42)
    model.fit(X_train, y_train)
    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"   [OK] Diabetes Model Accuracy: {acc:.4f} ({acc*100:.1f}%)")

    joblib.dump(model, os.path.join(MODELS_DIR, "diabetes_model.pkl"))
    print("   [SAVED] Diabetes model saved!")
    return acc

def train_heart_model():
    print("\n[*] Training Heart Disease Prediction Model...")
    df = generate_heart_dataset(600)
    features = ["age","sex","chest_pain_type","resting_bp","cholesterol","fasting_blood_sugar",
                "resting_ecg","max_heart_rate","exercise_angina","oldpeak","slope","ca","thal"]
    X = df[features]
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = GradientBoostingClassifier(n_estimators=150, max_depth=3, learning_rate=0.1, random_state=42)
    model.fit(X_train, y_train)
    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"   [OK] Heart Disease Model Accuracy: {acc:.4f} ({acc*100:.1f}%)")

    joblib.dump(model, os.path.join(MODELS_DIR, "heart_model.pkl"))
    print("   [SAVED] Heart disease model saved!")
    return acc

if __name__ == "__main__":
    print("=" * 55)
    print("  MediPredict AI -- Model Training Pipeline")
    print("=" * 55)
    d_acc = train_disease_model()
    diab_acc = train_diabetes_model()
    h_acc = train_heart_model()
    print("\n" + "=" * 55)
    print("  [DONE] All models trained and saved!")
    print(f"  Disease Prediction Accuracy : {d_acc*100:.1f}%")
    print(f"  Diabetes Prediction Accuracy: {diab_acc*100:.1f}%")
    print(f"  Heart Disease Accuracy      : {h_acc*100:.1f}%")
    print("=" * 55)
    print(f"\n  Models saved in: {MODELS_DIR}")
