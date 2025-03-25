# backend/routers/product_parts.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal

router = APIRouter()

class Part(BaseModel):
    type: Literal["모듈", "렌즈", "센서"]
    name: str

parts = []

@router.get("/product-parts")
def get_parts():
    return parts

@router.post("/product-parts")
def add_part(part: Part):
    new_id = len(parts) + 1
    new_part = { "id": new_id, **part.dict() }
    parts.append(new_part)
    return new_part
