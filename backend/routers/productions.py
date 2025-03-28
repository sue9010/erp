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
    # 1) 주문 존재 여부 확인
    order = find_by_order_number(data.order_number)
    if not order:
        raise HTTPException(status_code=404, detail="주문이 존재하지 않습니다.")

    # 2) "카메라" 등 category+name → "[카메라] CG320" 같은 라벨 활용
    #    order.products에서 해당 아이템 찾기

    # 3) 이미 생산된 시리얼 개수 구하기
    #    productions 리스트를 돌면서, order_number가 같은 생산 기록들 찾아서
    #    product_name이 같은 아이템들의 serial_numbers 길이 합산

    for item in data.items:
        # item.product_name = "[카메라] CG320" 라고 가정
        # 주문에서 'category' + 'name' 매칭되는 product 찾기
        # (문자열 파싱 or find approach)

        # ----- 문자열 파싱 예시 -----
        # item.product_name → "[카메라] CG320"
        label = item.product_name
        # label.split('] ') => ["[카메라", "CG320"]
        # [0][1:] => "카메라", [1] => "CG320"
        # 안전하게 처리
        if not (label.startswith("[") and "] " in label):
            raise HTTPException(status_code=400, detail=f"잘못된 product_name 형식 {label}")

        cat_part = label.split("] ")[0][1:]  # "카메라"
        name_part = label.split("] ")[1]     # "CG320"

        # 주문에서 매칭
        order_item = None
        for op in order["products"]:
            # 기본 제품
            if op["category"] == cat_part and op["name"] == name_part:
                order_item = op
                break
            # 옵션도 확인
            for opt in op.get("options", []):
                if opt["category"] == cat_part and opt["name"] == name_part:
                    order_item = opt
                    break
            if order_item:
                break

        if not order_item:
            raise HTTPException(status_code=400, detail=f"{label}는 주문에 포함되지 않은 제품입니다.")

        max_qty = order_item["quantity"]

        # 3) 이미 생산된 시리얼 개수
        already_produced_count = 0
        for existing in productions:
            if existing["order_number"] == data.order_number:
                for ex_item in existing["items"]:
                    if ex_item["product_name"] == label:
                        already_produced_count += len(ex_item["serial_numbers"])

        # 새로 생산하려는 시리얼 개수
        new_count = len(item.serial_numbers)

        # 최종 생산 총합이 max_qty 초과?
        if already_produced_count + new_count > max_qty:
            raise HTTPException(
                status_code=400,
                detail=f"{label}의 최대 생산 가능 수량({max_qty}개)를 초과합니다. "
                       f"이미 {already_produced_count}개 생산됨, 추가 {new_count}개 불가."
            )

    # 여기까지 통과하면 수량 검증 완료
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
    found = False
    for i, record in enumerate(productions):
        if record["id"] == production_id:
            found = True
            productions.pop(i)
            break
    if not found:
        raise HTTPException(status_code=404, detail="생산 내역을 찾을 수 없습니다.")
    return {"message": "생산 내역 삭제 완료"}

@router.put("/productions/{production_id}")
def update_production(production_id: int, data: Production):
    # 1) 기존 생산 내역을 찾는다
    existing_index = None
    for i, record in enumerate(productions):
        if record["id"] == production_id:
            existing_index = i
            break

    if existing_index is None:
        raise HTTPException(status_code=404, detail="생산 내역을 찾을 수 없습니다")

    # 2) 주문 존재 여부 확인
    order = find_by_order_number(data.order_number)
    if not order:
        raise HTTPException(status_code=404, detail="주문이 존재하지 않습니다.")

    # 3) 이미 생산된 시리얼 수 vs 주문 수량 검증
    #    (새로 수정된 items가 기존보다 많으면 안 됨)
    #    여기서는 기존 production (삭제 or 변경) 고려해야 해서 좀 더 세심하게 처리

    # (예시) 우선 기존 production을 삭제한 상태로 생산개수 재계산 후, 새로 items 추가
    old_record = productions[existing_index]
    # 임시로 제거
    temp_storage = productions[:existing_index] + productions[existing_index+1:]

    for item in data.items:
        label = item.product_name
        if not (label.startswith("[") and "] " in label):
            raise HTTPException(status_code=400, detail=f"잘못된 product_name 형식 {label}")

        cat_part = label.split("] ")[0][1:]
        name_part = label.split("] ")[1]

        # 주문에서 매칭
        order_item = None
        for op in order["products"]:
            if op["category"] == cat_part and op["name"] == name_part:
                order_item = op
                break
            for opt in op.get("options", []):
                if opt["category"] == cat_part and opt["name"] == name_part:
                    order_item = opt
                    break
            if order_item:
                break

        if not order_item:
            raise HTTPException(status_code=400, detail=f"{label}는 주문에 포함되지 않은 제품입니다.")

        max_qty = order_item["quantity"]

        # 3) 이미 생산된 시리얼 개수
        already_produced_count = 0
        for existing in temp_storage:
            if existing["order_number"] == data.order_number:
                for ex_item in existing["items"]:
                    if ex_item["product_name"] == label:
                        already_produced_count += len(ex_item["serial_numbers"])

        # 새로 생산하려는 시리얼 개수
        new_count = len(item.serial_numbers)

        # 최종 생산 총합이 max_qty 초과?
        if already_produced_count + new_count > max_qty:
            raise HTTPException(
                status_code=400,
                detail=f"{label}의 최대 생산 가능 수량({max_qty}개)를 초과합니다. "
                       f"이미 {already_produced_count}개 생산됨, 추가 {new_count}개 불가."
            )

    # 4) 검증 통과 → production 수정
    updated_record = {
        "id": production_id,
        "order_number": data.order_number,
        "scheduled_date": data.scheduled_date,
        "items": [item.dict() for item in data.items]
    }
    productions[existing_index] = updated_record
    return {"message": "생산 내역 수정 완료", "production": updated_record}


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
