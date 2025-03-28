# backend/routers/quotations.py

import os
import io
import re
import zipfile
import urllib.parse
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

from utils.file_store import register_file, get_files_by_entity, get_all_entity_files

router = APIRouter()

UPLOAD_DIR = "uploaded_quotation_files"

# --- 데이터 모델 ---
class ProductItem(BaseModel):
    product_name: str
    quantity: int
    unit_price: int
    options: Optional[List["ProductItem"]] = []

ProductItem.update_forward_refs()

class Quotation(BaseModel):
    quotation_number: str
    customer_name: str
    quotation_date: date
    due_date: date
    products: Optional[List[ProductItem]] = []
    total_amount_ex_vat: float
    total_amount_inc_vat: float
    note: Optional[str] = ""
    status: Optional[str] = "작성중"

class BulkQuotationCreate(BaseModel):
    quotations: List[Quotation]

# --- 임시 저장소 ---
quotations = [
    {
        "id": 1,
        "quotation_number": "QT-001",
        "customer_name": "삼성전자",
        "quotation_date": "2025-03-28",
        "due_date": "2025-04-10",
        "products": [
            {
                "product_name": "열화상 카메라 모듈",
                "quantity": 2,
                "unit_price": 500000,
                "options": [
                    { "product_name": "M 12mm-motor", "quantity": 2, "unit_price": 25000 }
                ]
            }
        ],
        "total_amount_ex_vat": 1050000,
        "total_amount_inc_vat": 1155000,
        "note": "납기 조율 필요",
        "status": "작성중"
    }
]

# --- 유틸 함수 ---
def get_max_id():
    return max(q["id"] for q in quotations) if quotations else 0

def find_by_quotation_number(quotation_number: str):
    return next((q for q in quotations if q["quotation_number"] == quotation_number), None)

# --- API 구현 ---
@router.get("/quotations")
def get_quotations():
    return quotations

@router.post("/quotations")
def add_quotation(quotation: Quotation):
    if find_by_quotation_number(quotation.quotation_number):
        raise HTTPException(status_code=400, detail="견적 번호 중복")

    new_id = get_max_id() + 1
    new_quotation = {**quotation.dict(), "id": new_id}
    quotations.append(new_quotation)
    return {"message": "견적 등록 완료", "quotation": new_quotation}

@router.put("/quotations/{quotation_id}")
def update_quotation(quotation_id: int, quotation: Quotation):
    for i, q in enumerate(quotations):
        if q["id"] == quotation_id:
            if quotation.quotation_number != q["quotation_number"] and find_by_quotation_number(quotation.quotation_number):
                raise HTTPException(status_code=400, detail="견적 번호 중복")
            quotations[i] = {**q, **quotation.dict(), "id": quotation_id}
            return {"message": "견적 수정 완료"}
    raise HTTPException(status_code=404, detail="견적 없음")

@router.post("/quotations/bulk")
def add_bulk_quotations(bulk_data: BulkQuotationCreate):
    current_max_id = get_max_id()
    new_quotations = []
    errors = []

    for idx, quotation in enumerate(bulk_data.quotations):
        if find_by_quotation_number(quotation.quotation_number):
            errors.append(f"견적번호 {quotation.quotation_number} 중복")
            continue
        new_id = current_max_id + idx + 1
        new_quotations.append({**quotation.dict(), "id": new_id})

    quotations.extend(new_quotations)
    return {"message": f"{len(new_quotations)}개 견적 추가", "errors": errors}

@router.delete("/quotations/{quotation_id}")
def delete_quotation(quotation_id: int):
    global quotations
    initial_count = len(quotations)
    quotations = [q for q in quotations if q["id"] != quotation_id]
    if len(quotations) == initial_count:
        raise HTTPException(status_code=404, detail="견적 없음")
    return {"message": "견적 삭제 완료"}

# ==== 파일 업로드 및 다운로드 ====

@router.post("/quotations/{quotation_id}/files")
def upload_quotation_file(quotation_id: int, file: UploadFile = File(...)):
    quotation = next((q for q in quotations if q["id"] == quotation_id), None)
    if not quotation:
        raise HTTPException(status_code=404, detail="견적을 찾을 수 없습니다")

    return register_file("quotations", quotation_id, file, UPLOAD_DIR)

@router.get("/quotations/{quotation_id}/files")
def list_quotation_files(quotation_id: int):
    return get_files_by_entity("quotations", quotation_id)

@router.get("/quotations/{quotation_id}/files/download-all")
def download_all_quotation_files(quotation_id: int):
    matched_files = get_all_entity_files("quotations", quotation_id)
    if not matched_files:
        raise HTTPException(status_code=404, detail="업로드된 파일이 없습니다.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in matched_files:
            if os.path.exists(f["path"]):
                zipf.write(f["path"], arcname=f["original_name"])

    zip_buffer.seek(0)
    number = next((q["quotation_number"] for q in quotations if q["id"] == quotation_id), "quotation")
    safe_name = re.sub(r'[^a-zA-Z0-9가-힣_]', '_', number)
    zip_filename = f"{safe_name}_첨부파일.zip"
    encoded = urllib.parse.quote(zip_filename)

    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded}"
        }
    )
