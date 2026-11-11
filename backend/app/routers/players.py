from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..db import get_db

router = APIRouter()

class PlayerCreate(BaseModel):
    nickname: str
    avatar: str = "👧"

class QuizResult(BaseModel):
    player_id: str
    province_id: str
    score: int
    total: int
    stars: int
    xp: int

@router.post("/players")
async def create_player(payload: PlayerCreate):
    db = get_db()
    if db is None:
        # fallback: return a local id
        return {"id": "local", "nickname": payload.nickname, "avatar": payload.avatar}
    import uuid
    pid = str(uuid.uuid4())
    try:
        await db.players.insert_one({"_id": pid, "nickname": payload.nickname, "avatar": payload.avatar, "xp": 0, "stars": 0, "level": 1})
        return {"id": pid, "nickname": payload.nickname, "avatar": payload.avatar}
    except Exception:
        # Database belum tersedia: permainan tetap bisa berjalan secara lokal.
        return {"id": "local", "nickname": payload.nickname, "avatar": payload.avatar}

@router.get("/players/{player_id}")
async def get_player(player_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database tidak tersedia")
    try:
        doc = await db.players.find_one({"_id": player_id})
    except Exception:
        raise HTTPException(status_code=503, detail="Database tidak tersedia")
    if not doc:
        raise HTTPException(status_code=404, detail="Pemain tidak ditemukan")
    doc["id"] = doc.pop("_id")
    return doc

@router.post("/quiz-results")
async def save_quiz_result(payload: QuizResult):
    db = get_db()
    if db is None:
        return {"status": "skipped"}
    try:
        await db.quiz_results.insert_one(payload.model_dump())
        # update player xp/stars
        await db.players.update_one(
            {"_id": payload.player_id},
            {"$inc": {"xp": payload.xp, "stars": payload.stars}},
        )
        return {"status": "saved"}
    except Exception:
        return {"status": "skipped"}

@router.get("/quiz-results")
async def list_quiz_results(player_id: str):
    db = get_db()
    if db is None:
        return []
    try:
        cursor = db.quiz_results.find({"player_id": player_id}).sort("province_id")
        out = []
        async for doc in cursor:
            doc.pop("_id", None)
            out.append(doc)
        return out
    except Exception:
        return []

@router.get("/achievements")
async def list_achievements():
    return [
        {"id": "first_quiz", "name": "Pertama Kali", "desc": "Selesaikan 1 kuis", "emoji": "🎯"},
        {"id": "five_provinces", "name": "Penjelajah", "desc": "Selesaikan kuis 5 provinsi", "emoji": "🗺️"},
        {"id": "perfect_score", "name": "Sempurna", "desc": "Dapatkan skor penuh", "emoji": "⭐"},
    ]