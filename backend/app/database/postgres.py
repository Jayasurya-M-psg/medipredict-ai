"""
Stub — PostgreSQL replaced by MongoDB for simplicity.
All tables are now MongoDB collections.
"""

async def create_tables():
    print("[OK] Using MongoDB for all storage (no PostgreSQL needed)")

async def get_db():
    # No-op stub — routes use MongoDB directly
    yield None
