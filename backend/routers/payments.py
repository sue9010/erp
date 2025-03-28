# backend/routers/payments.py

import os
import io
import re
import zipfile
import urllib.parse
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

from utils.file_store import register_file, get_files_by_entity, get_all_entity_files

router = APIRouter()

UPLOAD_DIR = "uploaded_payment_files"

# 입금 데이터 구조
class Payment(BaseModel):
    order_id: Optional[str] = None  # ⬅ int → str
    amount: int
    date: date
    depositor: str
    note: Optional[str] = None

# 메모리 기반 입금 리스트
payments = []

@router.get("/payments")
def get_payments():
    return payments

@router.get("/payments/by-order/{order_id}")
def get_payments_by_order(order_id: int):
    return [p for p in payments if p.get("order_id") == order_id]

@router.post("/payments")
def create_payment(payment: Payment):
    new_id = len(payments) + 1
    payment_record = {
        "id": new_id,
        **payment.dict()
    }
    payments.append(payment_record)
    return {"message": "입금이 등록되었습니다", "payment": payment_record}

@router.put("/payments/{payment_id}")
def update_payment(payment_id: int, payment: Payment):
    for i, p in enumerate(payments):
        if p["id"] == payment_id:
            payments[i] = {**p, **payment.dict(), "id": payment_id}
            return {"message": "입금이 수정되었습니다"}
    raise HTTPException(status_code=404, detail="입금 내역을 찾을 수 없습니다.")

@router.delete("/payments/{payment_id}")
def delete_payment(payment_id: int):
    global payments
    original_len = len(payments)
    payments = [p for p in payments if p["id"] != payment_id]
    if len(payments) == original_len:
        raise HTTPException(status_code=404, detail="입금 내역을 찾을 수 없습니다.")
    return {"message": "입금이 삭제되었습니다"}

# ==== 파일 업로드 및 다운로드 ====

@router.post("/payments/{payment_id}/files")
def upload_payment_file(payment_id: int, file: UploadFile = File(...)):
    payment = next((p for p in payments if p["id"] == payment_id), None)
    if not payment:
        raise HTTPException(status_code=404, detail="입금 내역을 찾을 수 없습니다")

    return register_file("payments", payment_id, file, UPLOAD_DIR)

@router.get("/payments/{payment_id}/files")
def list_payment_files(payment_id: int):
    return get_files_by_entity("payments", payment_id)

@router.get("/payments/{payment_id}/files/download-all")
def download_all_payment_files(payment_id: int):
    matched_files = get_all_entity_files("payments", payment_id)
    if not matched_files:
        raise HTTPException(status_code=404, detail="업로드된 파일이 없습니다.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in matched_files:
            if os.path.exists(f["path"]):
                zipf.write(f["path"], arcname=f["original_name"])

    zip_buffer.seek(0)
    zip_filename = f"payment_{payment_id}_첨부파일.zip"
    encoded = urllib.parse.quote(zip_filename)

    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded}"
        }
    )
