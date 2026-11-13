import os
from dotenv import load_dotenv

load_dotenv()

# Kosong = tanpa database. Aplikasi tetap jalan, progres disimpan di browser.
MONGO_URL = os.getenv("MONGO_URL", "").strip()
DB_NAME = os.getenv("DB_NAME", "bhinneka_tunggal_ika")

# Comma-separated list of allowed origins, e.g.
# CORS_ORIGINS=http://localhost:5173,https://bhinneka-tunggal-ika.vercel.app
_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").strip()
CORS_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]

# "*" allows any origin (berguna untuk preview/development).
ALLOW_ALL_ORIGINS = "*" in CORS_ORIGINS
if ALLOW_ALL_ORIGINS:
    CORS_ORIGINS = ["*"]
