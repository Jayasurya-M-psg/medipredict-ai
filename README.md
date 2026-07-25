# 🏥 MediPredict AI — AI-Powered Disease Prediction System

> PROJECT | INFORMATION TECHNOLOGY | Healthcare Domain

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://mongodb.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)

---

## 📖 About

**MediPredict AI** is a full-stack web application that uses Machine Learning to predict diseases from symptoms and assess health risks. It combines a Python FastAPI backend with 3 trained ML models, a React frontend with beautiful UI, and dual database architecture (MongoDB + PostgreSQL).

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **Disease Prediction** | Select from 132 symptoms → Predicts top-3 from 41 diseases |
| 💉 **Diabetes Risk** | Enter vitals → XGBoost model predicts diabetes risk % |
| ❤️ **Heart Disease Risk** | Cardiac data → Gradient Boosting predicts heart risk % |
| 👨‍⚕️ **Specialist Finder** | Recommends the right doctor for your predicted condition |
| 📊 **Health Dashboard** | History, trends, and prediction analytics with charts |
| 🤖 **AI Chatbot** | MediBot health assistant with keyword-based responses |
| ⚙️ **Admin Panel** | User management, system analytics, prediction logs |
| 🔐 **JWT Auth** | Secure login/register with token-based authentication |

## 🛠️ Tech Stack

**Backend:** Python 3.11, FastAPI, Scikit-learn, XGBoost, Motor (MongoDB), SQLAlchemy (PostgreSQL), JWT

**Frontend:** React 18, Vite, React Router, Recharts, Axios, Vanilla CSS

**Database:** MongoDB (predictions/history) + PostgreSQL (users)

**ML Models:**
- Random Forest (Disease prediction — 98%+ accuracy)
- XGBoost (Diabetes risk — ~82% accuracy)
- Gradient Boosting (Heart disease — ~87% accuracy)

## 🚀 Quick Start (Windows)

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Community Server
- PostgreSQL 16

### 1. Run the Setup Script
```batch
cd medipredict-ai
setup.bat
```
This will:
- Create Python virtual environment
- Install all backend dependencies
- Train all 3 ML models
- Install frontend dependencies

### 2. Start MongoDB & PostgreSQL
Make sure MongoDB is running on port 27017 and PostgreSQL on port 5432.

### 3. Configure Environment
```batch
cd backend
copy .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 4. Start Backend
```batch
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
# Backend runs on http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 5. Start Frontend
```batch
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 🐳 Docker Deployment (Easiest)

```bash
docker-compose up --build
# Access at http://localhost
```

## 📁 Project Structure

```
medipredict-ai/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── config.py         # Settings
│   │   ├── routes/           # API endpoints
│   │   │   ├── auth.py       # Register, login, profile
│   │   │   ├── predict.py    # ML prediction endpoints
│   │   │   ├── health.py     # Prediction history
│   │   │   └── admin.py      # Admin endpoints
│   │   ├── ml/               # Machine Learning
│   │   │   ├── train_models.py  # Training pipeline
│   │   │   ├── disease_predictor.py
│   │   │   ├── diabetes_predictor.py
│   │   │   └── heart_predictor.py
│   │   ├── models/           # Pydantic schemas & SQLAlchemy models
│   │   ├── database/         # MongoDB & PostgreSQL connections
│   │   └── utils/            # Auth helpers, disease info
│   ├── saved_models/         # Trained .pkl files (generated)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/            # Home, Predict, Dashboard, Profile, Admin
│       ├── components/       # Navbar, Chatbot
│       ├── contexts/         # AuthContext
│       └── services/         # API client
├── docker-compose.yml
└── setup.bat                 # Windows setup script
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Get JWT token |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/predict/symptoms` | List all symptoms |
| POST | `/api/predict/disease` | Disease prediction |
| POST | `/api/predict/diabetes` | Diabetes risk |
| POST | `/api/predict/heart` | Heart disease risk |
| GET  | `/api/health/history` | Prediction history |
| GET  | `/api/health/stats` | User statistics |
| GET  | `/api/admin/stats` | Admin analytics |

📖 **Full API docs:** `http://localhost:8000/docs`

## 🧠 Machine Learning Details

### Disease Prediction Model
- **Algorithm:** Random Forest (200 trees)
- **Dataset:** 41 diseases × 132 symptoms
- **Output:** Top-3 diseases with confidence %

### Diabetes Risk Model
- **Algorithm:** XGBoost
- **Features:** Glucose, BMI, Age, Blood Pressure, Insulin, etc.
- **Output:** Risk score (0-100%) + risk level

### Heart Disease Risk Model
- **Algorithm:** Gradient Boosting
- **Features:** Age, Cholesterol, ECG, Max HR, Chest Pain Type, etc.
- **Output:** Risk score (0-100%) + risk level + recommendations

## 👥 Team

Solo project by JAYASURYA M — Final Year, B.Tech INFORMATION TECHNOLOGY

## ⚠️ Disclaimer

> This application is developed for **educational purposes only** as a project. It is NOT intended for medical diagnosis. Always consult a qualified healthcare professional for medical advice.

---

*Built with ❤️ using Python, FastAPI, React, and Machine Learning*
