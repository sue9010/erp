# backend/routers/payments.py
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from datetime import date

router = APIRouter()

class Payment(BaseModel):
    order_id: Optional[int]  # 주문과 연결될 수도 있고 아닐 수도 있음
    amount: int
    date: date
    depositor: str
    note: Optional[str] = None

payments = []

@router.get("/payments")
def get_payments():
    return payments

@router.post("/payments")
def create_payment(payment: Payment):
    new_id = len(payments) + 1
    payment_record = {
        "id": new_id,
        **payment.dict()
    }
    payments.append(payment_record)
    return {"message": "입금이 등록되었습니다", "payment": payment_record}

@router.post("/payments/{payment_id}/upload")
async def upload_receipt(payment_id: int, file: UploadFile = File(...)):
    contents = await file.read()
    file_path = f"uploaded_files/payment_{payment_id}_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(contents)
    return {"message": "입금 파일이 업로드되었습니다", "file_path": file_path}

@router.get("/payments/by-order/{order_id}")
def get_payments_by_order(order_id: int):
    return [p for p in payments if p.get("order_id") == order_id]
