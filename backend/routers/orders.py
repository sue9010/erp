import os
import io
import re
import zipfile
import urllib.parse
from uuid import uuid4
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

UPLOAD_DIR = "uploaded_order_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- 데이터 모델 ---
class Order(BaseModel):
    po_number: str
    order_number: str
    vendor_name: str
    order_date: date
    due_date: date
    total_amount_ex_vat: float
    total_amount_inc_vat: float
    note: Optional[str] = ""
    status: Optional[str] = "접수"

class BulkOrderCreate(BaseModel):
    orders: List[Order]

# --- 데이터 저장소 (임시 메모리) ---
orders = [
    {
        "id": 1,
        "po_number": "PO-001",
        "order_number": "ORD-001",
        "vendor_name": "삼성전자",
        "order_date": "2025-03-27",
        "due_date": "2025-04-10",
        "total_amount_ex_vat": 10000000,
        "total_amount_inc_vat": 11000000,
        "note": "빠른 납기 요청",
        "status": "접수"
    }
]

uploaded_files = []

# --- 유틸 함수 ---
def get_max_id():
    return max(o["id"] for o in orders) if orders else 0

def find_by_order_number(order_number: str):
    return next((o for o in orders if o["order_number"] == order_number), None)

# --- API 구현 ---
@router.get("/orders")
def get_orders():
    return orders

@router.post("/orders")
def add_order(order: Order):
    if find_by_order_number(order.order_number):
        raise HTTPException(status_code=400, detail="접수 번호 중복")

    new_id = get_max_id() + 1
    new_order = {**order.dict(), "id": new_id}
    orders.append(new_order)
    return {"message": "주문 등록 완료", "order": new_order}

@router.put("/orders/{order_id}")
def update_order(order_id: int, order: Order):
    for i, o in enumerate(orders):
        if o["id"] == order_id:
            if order.order_number != o["order_number"] and find_by_order_number(order.order_number):
                raise HTTPException(status_code=400, detail="접수 번호 중복")
            orders[i] = {**o, **order.dict(), "id": order_id}
            return {"message": "주문 수정 완료"}
    raise HTTPException(status_code=404, detail="주문 없음")

@router.post("/orders/bulk")
def add_bulk_orders(bulk_order: BulkOrderCreate):
    current_max_id = get_max_id()
    new_orders = []
    errors = []

    for idx, order in enumerate(bulk_order.orders):
        if find_by_order_number(order.order_number):
            errors.append(f"접수번호 {order.order_number} 중복")
            continue
        new_id = current_max_id + idx + 1
        new_orders.append({**order.dict(), "id": new_id})

    orders.extend(new_orders)
    return {"message": f"{len(new_orders)}개 주문 추가", "errors": errors}

@router.delete("/orders/{order_id}")
def delete_order(order_id: int):
    global orders
    initial_count = len(orders)
    orders = [o for o in orders if o["id"] != order_id]
    if len(orders) == initial_count:
        raise HTTPException(status_code=404, detail="주문 없음")
    return {"message": "주문 삭제 완료"}

# ==== 파일 업로드 및 다운로드 ====

@router.post("/orders/{order_id}/files")
def upload_order_file(order_id: int, file: UploadFile = File(...)):
    order = next((o for o in orders if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다")

    original_filename = file.filename
    order_number = order["order_number"].replace(" ", "_")
    sanitized_name = f"{order_number}_{original_filename}"
    path = os.path.join(UPLOAD_DIR, sanitized_name)

    with open(path, "wb") as f:
        f.write(file.file.read())

    file_id = str(uuid4())
    uploaded_files.append({
        "id": file_id,
        "order_id": order_id,
        "path": path,
        "original_name": original_filename
    })

    return {"file_id": file_id, "original_name": original_filename}

@router.get("/orders/{order_id}/files")
def list_order_files(order_id: int):
    files = [
        {
            "file_id": f["id"],
            "original_name": f["original_name"]
        }
        for f in uploaded_files if f["order_id"] == order_id
    ]
    return files

@router.get("/orders/{order_id}/files/download-all")
def download_all_order_files(order_id: int):
    matched_files = [f for f in uploaded_files if f["order_id"] == order_id]
    if not matched_files:
        raise HTTPException(status_code=404, detail="업로드된 파일이 없습니다.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in matched_files:
            if os.path.exists(f["path"]):
                zipf.write(f["path"], arcname=f["original_name"])

    zip_buffer.seek(0)
    order_number = next((o["order_number"] for o in orders if o["id"] == order_id), "order")
    safe_name = re.sub(r'[^a-zA-Z0-9가-힣_]', '_', order_number)
    zip_filename = f"{safe_name}_첨부파일.zip"
    encoded = urllib.parse.quote(zip_filename)

    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded}"
        }
    )

@router.get("/files/{file_id}")
def download_file(file_id: str):
    file_meta = next((f for f in uploaded_files if f["id"] == file_id), None)
    if not file_meta:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    return FileResponse(path=file_meta["path"], filename=file_meta["original_name"])

@router.delete("/files/{file_id}")
def delete_file(file_id: str):
    global uploaded_files
    file_meta = next((f for f in uploaded_files if f["id"] == file_id), None)
    if not file_meta:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
    try:
        os.remove(file_meta["path"])
    except FileNotFoundError:
        pass
    uploaded_files = [f for f in uploaded_files if f["id"] != file_id]
    return {"message": "파일이 삭제되었습니다"}
