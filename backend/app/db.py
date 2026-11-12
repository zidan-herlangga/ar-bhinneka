from motor.motor_asyncio import AsyncIOMotorClient
from .config import MONGO_URL, DB_NAME

client: AsyncIOMotorClient | None = None
db = None

async def connect():
    global client, db
    if not MONGO_URL:
        # Tanpa MONGO_URL: endpoint yang butuh database memakai fallback lokal.
        client = None
        db = None
        return
    client = AsyncIOMotorClient(
        MONGO_URL,
        serverSelectionTimeoutMS=2000,
        connectTimeoutMS=2000,
    )
    db = client[DB_NAME]

async def disconnect():
    global client
    if client:
        client.close()

def get_db():
    return db
