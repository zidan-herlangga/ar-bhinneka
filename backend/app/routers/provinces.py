from fastapi import APIRouter, HTTPException
from ..data.provinces import PROVINCES, REGION_LABELS

router = APIRouter()

@router.get("/provinces")
async def list_provinces(region: str | None = None):
    if region:
        return [p for p in PROVINCES if p["region"] == region]
    return PROVINCES

@router.get("/provinces/{province_id}")
async def get_province(province_id: str):
    for p in PROVINCES:
        if p["id"] == province_id:
            return p
    raise HTTPException(status_code=404, detail="Provinsi tidak ditemukan")

@router.get("/regions")
async def list_regions():
    return [{"id": k, "label": v} for k, v in REGION_LABELS.items()]