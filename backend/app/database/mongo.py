"""
MongoDB connection with async mongomock fallback.
Uses real MongoDB if running, otherwise falls back to
mongomock.motor_asyncio (fully async-compatible in-memory DB).
"""
import asyncio
from app.config import settings

class MongoDB:
    client = None
    db = None
    using_mock: bool = False

mongo = MongoDB()

async def connect_to_mongo():
    # ── Try real MongoDB first ──────────────────────────────────────
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
        await asyncio.wait_for(client.server_info(), timeout=3)
        mongo.client = client
        mongo.db     = mongo.client[settings.MONGO_DB_NAME]
        mongo.using_mock = False
        await mongo.db.users.create_index("email", unique=True)
        print(f"[OK] Connected to real MongoDB: {settings.MONGO_DB_NAME}")

    # ── Fall back to async mongomock ────────────────────────────────
    except Exception:
        print("[WARN] Real MongoDB not found — using async in-memory mock")
        print("[TIP ] Install MongoDB Community for persistent data.")
        try:
            from mongomock.motor_asyncio import AsyncIOMotorClient as MockClient
            mongo.client     = MockClient()
            mongo.db         = mongo.client[settings.MONGO_DB_NAME]
            mongo.using_mock = True
            print("[OK] mongomock async (in-memory) database is ready")
        except ImportError:
            # Last resort: plain mongomock with sync wrapper shim
            import mongomock
            mongo.client     = mongomock.MongoClient()
            mongo.db         = _SyncToAsyncDB(mongo.client[settings.MONGO_DB_NAME])
            mongo.using_mock = True
            print("[OK] mongomock sync shim database is ready")

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
