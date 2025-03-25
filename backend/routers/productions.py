# backend/routers/productions.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import date

router = APIRouter()

# 생산 데이터 모델
class Production(BaseModel):
    product_name: str
    scheduled_date: date
    serial_numbers: List[str]

productions = []

@router.get("/productions")
def get_productions():
    return productions

@router.post("/productions")
def create_production(production: Production):
    new_id = len(productions) + 1

    if not production.serial_numbers:
        raise HTTPException(status_code=400, detail="시리얼 번호는 하나 이상 필요합니다.")

    new_record = {
        "id": new_id,
        "product_name": production.product_name,
        "scheduled_date": production.scheduled_date,
        "serial_numbers": production.serial_numbers
    }

    productions.append(new_record)
    return {"message": "생산 등록 완료", "production": new_record}
