# backend/routers/remittances.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
import os

router = APIRouter()

class Remittance(BaseModel):
    purchase_order_id: int
    amount: int
    date: date
    memo: Optional[str] = None

remittances = []

@router.get("/remittances")
def get_remittances():
    return remittances

@router.post("/remittances")
def create_remittance(remit: Remittance):
    new_id = len(remittances) + 1
    new_record = {
        "id": new_id,
        **remit.dict(),
        "file_path": None
    }
    remittances.append(new_record)
    return {"message": "송금 등록 완료", "remittance": new_record}

@router.post("/remittances/{remit_id}/upload")
async def upload_remittance_file(remit_id: int, file: UploadFile = File(...)):
    remit = next((r for r in remittances if r["id"] == remit_id), None)
    if not remit:
        raise HTTPException(status_code=404, detail="해당 송금 내역을 찾을 수 없습니다.")

    os.makedirs("uploaded_files", exist_ok=True)
    file_path = f"uploaded_files/remittance_{remit_id}_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    remit["file_path"] = file_path
    return {"message": "송금 파일 업로드 완료", "file_path": file_path}
