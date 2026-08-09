# 🏥 MediPredict AI

<div align="center">

![MediPredict AI](https://img.shields.io/badge/MediPredict-AI-6366f1?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Android](https://img.shields.io/badge/Android-App-3DDC84?style=for-the-badge&logo=android&logoColor=white)

**An AI-powered health prediction web & Android application** built with React, FastAPI, and Machine Learning. Predict diseases, assess heart & diabetes risk, calculate BMI, find nearby hospitals, and download professional health reports — all in one app.

🌐 **Live Demo:** [frontend-kappa-snowy-21.vercel.app](https://frontend-kappa-snowy-21.vercel.app)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **Disease Prediction** | Predict diseases from symptoms using ML (133 symptoms, 41 diseases) |
| 💉 **Diabetes Risk** | Assess diabetes risk with clinical parameters |
| ❤️ **Heart Risk** | Heart disease risk assessment with confidence scoring |
| ⚖️ **BMI Calculator** | Calculate BMI with visual gauge and health advice |
| 🏥 **Nearby Hospitals** | Find hospitals within 10km by GPS or city name |
| 📄 **Health Report PDF** | Download a professional PDF report of all predictions |
| 📊 **Health Dashboard** | View full prediction history with expandable cards |
| 👤 **User Accounts** | Register/login with email — data saved permanently |
| 🤖 **AI Chatbot** | Built-in health chatbot assistant |
| ⚙️ **Admin Panel** | User management and analytics for administrators |

---

## 🖥️ Tech Stack

### Frontend
- **React 18** + Vite
- **React Router** for navigation
- **Recharts** for health analytics charts
- **jsPDF + jsPDF-AutoTable** for PDF generation
- **Capacitor** for Android app wrapper

### Backend
- **FastAPI** (Python) — REST API
- **Scikit-learn** — ML models (Random Forest, SVM, Naive Bayes)
- **MongoDB Atlas** — cloud database for user accounts & history
- **httpx** — async HTTP for hospital data proxy

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas (Free Tier)
- **Android:** Capacitor (APK)

---

## 📱 App Screenshots

> Disease Prediction → Dashboard → BMI Calculator → Nearby Hospitals

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (free)

### 1. Clone the repository
```bash
git clone https://github.com/Jayasurya-M-psg/medipredict-ai.git
cd medipredict-ai
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
MONGO_URI=your_mongodb_atlas_uri
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Train ML models
python app/ml/train_models.py

# Run server
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
VITE_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

### 4. Android App (optional)
```bash
cd frontend
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

---

## 📂 Project Structure

```
medipredict-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # App configuration
│   │   ├── routes/
│   │   │   ├── auth.py          # Login / Register
│   │   │   ├── predict.py       # ML prediction endpoints
│   │   │   ├── health.py        # History & stats
│   │   │   ├── hospitals.py     # Hospital search proxy
│   │   │   └── admin.py         # Admin management
│   │   ├── ml/
│   │   │   ├── disease_predictor.py
│   │   │   ├── diabetes_predictor.py
│   │   │   ├── heart_predictor.py
│   │   │   └── train_models.py
│   │   ├── models/              # Pydantic schemas
│   │   └── database/            # MongoDB connection
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx         # Landing page
    │   │   ├── Predict.jsx      # Disease/Diabetes/Heart prediction
    │   │   ├── Dashboard.jsx    # History & analytics
    │   │   ├── BMI.jsx          # BMI Calculator
    │   │   ├── Hospitals.jsx    # Nearby hospital finder
    │   │   ├── Profile.jsx      # User profile
    │   │   └── Admin.jsx        # Admin panel
    │   ├── components/
    │   │   ├── Navbar/
    │   │   └── Chatbot/
    │   ├── utils/
    │   │   └── pdfReport.js     # PDF generation
    │   ├── services/
    │   │   └── api.js           # API calls
    │   └── contexts/
    │       └── AuthContext.jsx  # Auth state
    └── android/                 # Capacitor Android project
```

---

## 🤖 ML Models

| Model | Algorithm | Accuracy |
|---|---|---|
| Disease Prediction | Random Forest + Naive Bayes + SVM | ~95% |
| Diabetes Risk | Random Forest Classifier | ~90% |
| Heart Risk | Gradient Boosting Classifier | ~88% |

- **133 symptoms** for disease prediction
- **41 diseases** covered
- Confidence scores and specialist recommendations included

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/predict/disease` | Disease prediction |
| POST | `/api/predict/diabetes` | Diabetes risk |
| POST | `/api/predict/heart` | Heart risk |
| GET | `/api/health/history` | User prediction history |
| GET | `/api/health/stats` | Dashboard statistics |
| GET | `/api/hospitals` | Nearby hospital search |
| GET | `/api/admin/users` | Admin: list users |

---

## 📋 Environment Variables

### Backend (`.env`)
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/medipredict
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
APP_VERSION=2.0.0
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (`.env`)
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🔒 Security

- JWT-based authentication (7-day tokens)
- Bcrypt password hashing
- CORS configured for specific origins
- Admin role-based access control

---

## 📄 Disclaimer

This project is built for educational and personal health awareness purposes.  
Always consult a qualified doctor for medical advice.

---

## 👤 Author

**Jayasurya M**  
[![GitHub](https://img.shields.io/badge/GitHub-Jayasurya--M--psg-181717?style=flat&logo=github)](https://github.com/Jayasurya-M-psg)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Jayasurya--M--psg-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jayasurya-m-766892345/)

---

