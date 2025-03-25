# backend/routers/shipments.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
import os

router = APIRouter()

class Shipment(BaseModel):
    order_id: str
    tracking_number: str
    shipped_date: date

shipments = []

@router.get("/shipments")
def get_shipments():
    return shipments

@router.post("/shipments")
def create_shipment(shipment: Shipment):
    new_id = len(shipments) + 1
    new_record = {
        "id": new_id,
        **shipment.dict(),
        "file_path": None
    }
    shipments.append(new_record)
    return {"message": "배송 등록 완료", "shipment": new_record}

@router.post("/shipments/{shipment_id}/upload")
async def upload_file(shipment_id: int, file: UploadFile = File(...)):
    shipment = next((s for s in shipments if s["id"] == shipment_id), None)
    if not shipment:
        raise HTTPException(status_code=404, detail="해당 배송 건을 찾을 수 없습니다.")
    
    os.makedirs("uploaded_files", exist_ok=True)
    file_path = f"uploaded_files/shipment_{shipment_id}_{file.filename}"
    
    with open(file_path, "wb") as f:
        f.write(await file.read())

    shipment["file_path"] = file_path
    return {"message": "파일 업로드 완료", "file_path": file_path}
