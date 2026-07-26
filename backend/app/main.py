from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.mongo import connect_to_mongo, close_mongo_connection
from app.routes import auth, predict, health, admin

app = FastAPI(
    title="MediPredict AI API",
    description="AI-Powered Disease Prediction & Health Risk Assessment System",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=False if "*" in settings.origins_list else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_to_mongo()
    await seed_demo_users()
    print(f"[START] {settings.APP_NAME} v{settings.APP_VERSION} is running!")

async def seed_demo_users():
    """Seed demo users so login always works even with in-memory DB."""
    from app.database.mongo import get_mongo_db
    from app.utils.auth import hash_password
    from datetime import datetime
    import uuid

    db = get_mongo_db()
    demo_users = [
        {
            "_id": "admin-demo-001",
            "id": "admin-demo-001",
            "full_name": "Admin User",
            "email": "admin@medipredict.ai",
            "hashed_password": hash_password("admin123"),
            "role": "admin",
            "is_active": True,
            "created_at": datetime.utcnow(),
        },
        {
            "_id": "jayasurya-001",
            "id": "jayasurya-001",
            "full_name": "Jayasurya M",
            "email": "jayasuryamurugesan29@gmail.com",
            "hashed_password": hash_password("jayas123"),
            "role": "admin",
            "is_active": True,
            "created_at": datetime.utcnow(),
        },
    ]
    for user in demo_users:
        try:
            existing = await db.users.find_one({"email": user["email"]})
            if not existing:
                await db.users.insert_one(user)
                print(f"[SEED] Created user: {user['email']}")
        except Exception:
            pass  # Already exists — skip

@app.on_event("shutdown")
async def shutdown():
    await close_mongo_connection()

app.include_router(auth.router,    prefix="/api/auth",    tags=["Authentication"])
app.include_router(predict.router, prefix="/api/predict", tags=["Predictions"])
app.include_router(health.router,  prefix="/api/health",  tags=["Health Records"])
app.include_router(admin.router,   prefix="/api/admin",   tags=["Admin"])

@app.get("/", tags=["Root"])
async def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running", "docs": "/docs"}

@app.get("/api/health-check", tags=["Root"])
async def health_check():
    return {"status": "ok", "message": "MediPredict AI API is healthy"}
