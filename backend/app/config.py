import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "bhinneka_tunggal_ika")

# Comma-separated list of allowed origins, e.g.
# CORS_ORIGINS=http://localhost:5173,https://ar-bhinneka.vercel.app
_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").strip()
CORS_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]

# "*" allows any origin (berguna untuk preview/development).
ALLOW_ALL_ORIGINS = "*" in CORS_ORIGINS
if ALLOW_ALL_ORIGINS:
    CORS_ORIGINS = ["*"]
