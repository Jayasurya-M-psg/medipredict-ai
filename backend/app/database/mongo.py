"""
MongoDB connection — connects to MongoDB Atlas (persistent cloud DB).
Falls back to in-memory mock only if Atlas URI is not configured.
"""
import asyncio
from app.config import settings

class MongoDB:
    client = None
    db = None
    using_mock: bool = False

mongo = MongoDB()

async def connect_to_mongo():
    # ── Try real MongoDB Atlas with generous timeout ────────────────
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        print(f"[INFO] Connecting to MongoDB Atlas...")
        # Increase timeout to 15 seconds for Atlas cold-start
        client = AsyncIOMotorClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=15000,
            connectTimeoutMS=15000,
            socketTimeoutMS=30000,
        )
        # Ping to verify connection
        await asyncio.wait_for(client.admin.command('ping'), timeout=15)
        mongo.client     = client
        mongo.db         = mongo.client[settings.MONGO_DB_NAME]
        mongo.using_mock = False
        await mongo.db.users.create_index("email", unique=True)
        print(f"[OK] Connected to MongoDB Atlas: {settings.MONGO_DB_NAME}")
        return

    except Exception as e:
        print(f"[ERROR] MongoDB Atlas connection failed: {e}")

    # ── Only fall back to mock if MONGO_URI is local/default ───────
    is_local = "localhost" in settings.MONGO_URI or "127.0.0.1" in settings.MONGO_URI
    if not is_local:
        # Atlas URI configured but failed — retry once more with longer wait
        print("[WARN] Retrying Atlas connection in 5 seconds...")
        await asyncio.sleep(5)
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            client = AsyncIOMotorClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=20000,
                connectTimeoutMS=20000,
            )
            await asyncio.wait_for(client.admin.command('ping'), timeout=20)
            mongo.client     = client
            mongo.db         = mongo.client[settings.MONGO_DB_NAME]
            mongo.using_mock = False
            await mongo.db.users.create_index("email", unique=True)
            print(f"[OK] Connected to MongoDB Atlas on retry: {settings.MONGO_DB_NAME}")
            return
        except Exception as e2:
            print(f"[ERROR] Atlas retry also failed: {e2}")
            print("[CRITICAL] All user data will be LOST on restart. Check MONGO_URI.")

    # ── Fallback to in-memory (only for local dev) ──────────────────
    print("[WARN] Falling back to in-memory mock DB (data not persistent)")
    try:
        from mongomock.motor_asyncio import AsyncIOMotorClient as MockClient
        mongo.client     = MockClient()
        mongo.db         = mongo.client[settings.MONGO_DB_NAME]
        mongo.using_mock = True
        print("[OK] In-memory mock DB ready (local dev only)")
    except ImportError:
        import mongomock
        mongo.client     = mongomock.MongoClient()
        mongo.db         = _SyncToAsyncDB(mongo.client[settings.MONGO_DB_NAME])
        mongo.using_mock = True
        print("[OK] Sync mock DB shim ready (local dev only)")

async def close_mongo_connection():
    if mongo.client and not mongo.using_mock:
        mongo.client.close()

def get_mongo_db():
    return mongo.db


# ── Sync-to-Async shim (only used if mongomock.motor_asyncio missing) ──────
class _SyncCollection:
    """Wraps a synchronous mongomock collection with async methods."""
    def __init__(self, col):
        self._col = col

    async def find_one(self, *a, **kw):     return self._col.find_one(*a, **kw)
    async def insert_one(self, *a, **kw):   return self._col.insert_one(*a, **kw)
    async def update_one(self, *a, **kw):   return self._col.update_one(*a, **kw)
    async def delete_one(self, *a, **kw):   return self._col.delete_one(*a, **kw)
    async def count_documents(self, *a, **kw): return self._col.count_documents(*a, **kw)
    async def create_index(self, *a, **kw): return self._col.create_index(*a, **kw)

    def find(self, *a, **kw):
        return _SyncCursor(self._col.find(*a, **kw))

class _SyncCursor:
    """Wraps a synchronous mongomock cursor with async methods."""
    def __init__(self, cursor):
        self._cursor = cursor

    def sort(self, *a, **kw):
        return _SyncCursor(self._cursor.sort(*a, **kw))

    def skip(self, n):
        return _SyncCursor(self._cursor.skip(n))

    def limit(self, n):
        return _SyncCursor(self._cursor.limit(n))

    async def to_list(self, length=None):
        return list(self._cursor)

class _SyncToAsyncDB:
    """Wraps a synchronous mongomock DB so collections return _SyncCollection."""
    def __init__(self, db):
        self._db = db

    def __getattr__(self, name):
        return _SyncCollection(self._db[name])

    def __getitem__(self, name):
        return _SyncCollection(self._db[name])
