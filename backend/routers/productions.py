# backend/routers/productions.py

import os
import io
import zipfile
import urllib.parse
import re
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from datetime import date

from utils.file_store import register_file, get_files_by_entity, get_all_entity_files
from routers.orders import find_by_order_number  # 주문에서 제품 목록 불러오기

router = APIRouter()

UPLOAD_DIR = "uploaded_production_files"

# --- 데이터 모델 ---
class ProductionItem(BaseModel):
    product_name: str
    serial_numbers: List[str]

class Production(BaseModel):
    order_number: str
    scheduled_date: date
    items: List[ProductionItem]

productions = []

# --- API 구현 ---
@router.get("/productions")
def get_productions():
    return productions

@router.post("/productions")
def create_production(data: Production):
    # 주문이 존재하는지 확인
    order = find_by_order_number(data.order_number)
    if not order:
        raise HTTPException(status_code=404, detail="주문이 존재하지 않습니다.")

    # 주문에 등록된 제품 목록 가져오기
    expected_products = [p["product_name"] for p in order.get("products", [])]

    # 제품 매칭 확인
    for item in data.items:
        if item.product_name not in expected_products:
            raise HTTPException(
                status_code=400,
                detail=f"'{item.product_name}'는 주문 {data.order_number}에 포함되지 않은 제품입니다."
            )
        if not item.serial_numbers:
            raise HTTPException(
                status_code=400,
                detail=f"{item.product_name}의 시리얼 번호가 비어 있습니다."
            )

    new_id = len(productions) + 1
    new_record = {
        "id": new_id,
        "order_number": data.order_number,
        "scheduled_date": data.scheduled_date,
        "items": [item.dict() for item in data.items]
    }
    productions.append(new_record)
    return {"message": "생산 등록 완료", "production": new_record}

@router.delete("/productions/{production_id}")
def delete_production(production_id: int):
    global productions
    before = len(productions)
    productions = [p for p in productions if p["id"] != production_id]
    if len(productions) == before:
        raise HTTPException(status_code=404, detail="생산 내역을 찾을 수 없습니다.")
    return {"message": "생산이 삭제되었습니다"}

# ==== 파일 업로드 및 다운로드 ====

@router.post("/productions/{production_id}/files")
def upload_production_file(production_id: int, file: UploadFile = File(...)):
    production = next((p for p in productions if p["id"] == production_id), None)
    if not production:
        raise HTTPException(status_code=404, detail="생산 내역을 찾을 수 없습니다.")
    return register_file("productions", production_id, file, UPLOAD_DIR)

@router.get("/productions/{production_id}/files")
def list_production_files(production_id: int):
    return get_files_by_entity("productions", production_id)

@router.get("/productions/{production_id}/files/download-all")
def download_all_production_files(production_id: int):
    matched_files = get_all_entity_files("productions", production_id)
    if not matched_files:
        raise HTTPException(status_code=404, detail="업로드된 파일이 없습니다.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in matched_files:
            if os.path.exists(f["path"]):
                zipf.write(f["path"], arcname=f["original_name"])

    zip_buffer.seek(0)
    safe_name = f"production_{production_id}"
    zip_filename = f"{safe_name}_첨부파일.zip"
    encoded = urllib.parse.quote(zip_filename)

    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded}"
        }
    )
