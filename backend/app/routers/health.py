from fastapi import APIRouter

from ..db import get_db

router = APIRouter()

@router.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "bhinneka-tunggal-ika-api",
        "database": "configured" if get_db() is not None else "disabled",
    }
