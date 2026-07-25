@echo off
echo ============================================
echo  MediPredict AI - Windows Setup Script
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.11+ from python.org
    pause & exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from nodejs.org
    pause & exit /b 1
)

echo [1/5] Setting up Python virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo [2/5] Installing Python dependencies...
pip install -r requirements.txt

echo [3/5] Copying environment config...
if not exist .env (
    copy .env.example .env
    echo     .env file created from template. Edit it if needed.
)

echo [4/5] Training ML models (this may take 2-3 minutes)...
python -m app.ml.train_models

echo [5/5] Installing frontend dependencies...
cd ..\frontend
call npm install

echo.
echo ============================================
echo  Setup complete!
echo ============================================
echo.
echo To START the application:
echo.
echo   TERMINAL 1 (Backend):
echo     cd backend
echo     venv\Scripts\activate
echo     uvicorn app.main:app --reload
echo.
echo   TERMINAL 2 (Frontend):
echo     cd frontend
echo     npm run dev
echo.
echo   Then open: http://localhost:5173
echo.
echo NOTE: You need MongoDB and PostgreSQL running.
echo   Quick option: Install MongoDB Community + pgAdmin
echo   Or use Docker: docker-compose up
echo.
pause
