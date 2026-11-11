from fastapi import APIRouter, HTTPException
from ..data.cultures import CULTURES, CATEGORY_LABELS

router = APIRouter()

@router.get("/cultures")
async def list_cultures(province_id: str | None = None, category: str | None = None):
    res = CULTURES
    if province_id:
        res = [c for c in res if c["province_id"] == province_id]
    if category:
        res = [c for c in res if c["category"] == category]
    return res

@router.get("/cultures/{culture_id}")
async def get_culture(culture_id: str):
    for c in CULTURES:
        if c["id"] == culture_id:
            return c
    raise HTTPException(status_code=404, detail="Data budaya tidak ditemukan")

@router.get("/culture-categories")
async def list_categories():
    return [{"id": k, "label": v} for k, v in CATEGORY_LABELS.items()]