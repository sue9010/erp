from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import os, io, zipfile, re, urllib.parse

from utils.file_store import register_file, get_files_by_entity, get_all_entity_files

router = APIRouter()

# ==== 모델 정의 ====
class Vendor(BaseModel):
    company_name: str
    contact_person: str
    contact: str
    country: str
    address: str
    export_license_required: str
    export_license_type: str
    export_license_number: str
    shipping_method: str 
    shipping_account: str
    note: str = ""

class BulkVendorCreate(BaseModel):
    vendors: List[Vendor]

# ==== 전역 상태 ====
vendors = [
    {
        "id": 1,
        "company_name": "COX",
        "contact_person": "David",
        "contact": "010-1234-5678",
        "country": "대한민국",
        "address": "서울시 강남구",
        "export_license_required": "불필요",
        "export_license_type": "해당 없음",
        "export_license_number": "해당 없음",
        "shipping_method": "택배",
        "shipping_account": "COX",
        "note": "우수 공급업체",
        "file_id": None
    },
]

UPLOAD_DIR = "uploaded_vendor_files"

# ==== 기본 CRUD ====
def get_max_id():
    return max(v["id"] for v in vendors) if vendors else 0

@router.get("/vendors")
def get_vendors():
    return vendors

@router.post("/vendors")
def add_vendor(vendor: Vendor):
    if any(v["company_name"] == vendor.company_name for v in vendors):
        raise HTTPException(status_code=400, detail="중복된 공급업체 이름이 존재합니다")

    new_id = get_max_id() + 1
    new_vendor = {"id": new_id, "file_id": None, **vendor.dict()}
    vendors.append(new_vendor)
    return {"message": "공급업체가 추가되었습니다", "vendor": new_vendor}

@router.post("/vendors/bulk")
def add_bulk_vendors(bulk_vendor: BulkVendorCreate):
    current_max_id = get_max_id()
    new_vendors = []
    errors = []

    for idx, vendor in enumerate(bulk_vendor.vendors):
        if any(v["company_name"] == vendor.company_name for v in vendors):
            errors.append(f"공급업체 이름 '{vendor.company_name}'이(가) 중복됩니다.")
            continue

        new_id = current_max_id + idx + 1
        new_vendor = {"id": new_id, "file_id": None, **vendor.dict()}
        new_vendors.append(new_vendor)

    vendors.extend(new_vendors)

    if errors:
        return {"message": "일부 공급업체 추가 실패", "errors": errors, "added": len(new_vendors)}

    return {"message": f"{len(new_vendors)}개의 공급업체가 추가되었습니다", "added": len(new_vendors)}

@router.put("/vendors/{vendor_id}")
def update_vendor(vendor_id: int, vendor: Vendor):
    for v in vendors:
        if v["id"] == vendor_id:
            v.update(vendor.dict())
            return {"message": "공급업체가 수정되었습니다", "vendor": v}
    raise HTTPException(status_code=404, detail="공급업체를 찾을 수 없습니다")

@router.delete("/vendors/{vendor_id}")
def delete_vendor(vendor_id: int):
    global vendors
    initial_length = len(vendors)
    vendors = [v for v in vendors if v["id"] != vendor_id]

    if len(vendors) == initial_length:
        raise HTTPException(status_code=404, detail="공급업체를 찾을 수 없습니다")
    return {"message": "공급업체가 삭제되었습니다"}

# ==== 파일 업로드 및 다운로드 ====

@router.post("/vendors/{vendor_id}/files")
def upload_vendor_file(vendor_id: int, file: UploadFile = File(...)):
    vendor = next((v for v in vendors if v["id"] == vendor_id), None)
    if not vendor:
        raise HTTPException(status_code=404, detail="공급업체를 찾을 수 없습니다")

    result = register_file("vendors", vendor_id, file, UPLOAD_DIR)
    vendor["file_id"] = result["file_id"]
    return result

@router.get("/vendors/{vendor_id}/files")
def list_vendor_files(vendor_id: int):
    vendor = next((v for v in vendors if v["id"] == vendor_id), None)
    if not vendor:
        raise HTTPException(status_code=404, detail="공급업체를 찾을 수 없습니다")

    return get_files_by_entity("vendors", vendor_id)

@router.get("/vendors/{vendor_id}/files/download-all")
def download_all_vendor_files(vendor_id: int):
    vendor = next((v for v in vendors if v["id"] == vendor_id), None)
    if not vendor:
        raise HTTPException(status_code=404, detail="공급업체를 찾을 수 없습니다")

    matched_files = get_all_entity_files("vendors", vendor_id)
    if not matched_files:
        raise HTTPException(status_code=404, detail="업로드된 파일이 없습니다.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in matched_files:
            if not os.path.exists(f["path"]):
                continue
            try:
                zipf.write(f["path"], arcname=f["original_name"])
            except Exception as e:
                print(f"[❌ 압축 실패]: {f['path']} - {e}")
                continue

    zip_buffer.seek(0)
    safe_name = re.sub(r'[^a-zA-Z0-9가-힣_]', '_', vendor["company_name"])
    zip_filename = f"{safe_name}_첨부파일.zip"
    encoded = urllib.parse.quote(zip_filename)

    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded}"
        }
    )
