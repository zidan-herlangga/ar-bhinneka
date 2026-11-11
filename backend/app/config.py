import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "bhinneka_tunggal_ika")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")