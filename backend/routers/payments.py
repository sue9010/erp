# backend/routers/payments.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
import os

router = APIRouter()

# 입금 데이터 구조
class Payment(BaseModel):
    order_id: Optional[int] = None  # 주문과 연결 가능
    amount: int
    date: date
    depositor: str
    note: Optional[str] = None

# 메모리 기반 입금 리스트
payments = []

@router.get("/payments")
def get_payments():
    return payments

@router.post("/payments")
def create_payment(payment: Payment):
    new_id = len(payments) + 1
    payment_record = {
        "id": new_id,
        **payment.dict(),
        "file_path": None
    }
    payments.append(payment_record)
    return {"message": "입금이 등록되었습니다", "payment": payment_record}

@router.post("/payments/{payment_id}/upload")
async def upload_receipt(payment_id: int, file: UploadFile = File(...)):
    payment = next((p for p in payments if p["id"] == payment_id), None)
    if not payment:
        raise HTTPException(status_code=404, detail="해당 입금 내역을 찾을 수 없습니다.")

    os.makedirs("uploaded_files", exist_ok=True)
    file_path = f"uploaded_files/payment_{payment_id}_{file.filename}"
    
    with open(file_path, "wb") as f:
        f.write(await file.read())

    payment["file_path"] = file_path
    return {"message": "입금 파일이 업로드되었습니다", "file_path": file_path}

@router.get("/payments/by-order/{order_id}")
def get_payments_by_order(order_id: int):
    return [p for p in payments if p.get("order_id") == order_id]
