from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse  
from pydantic import BaseModel
from typing import List
import os, io, zipfile, re
from uuid import uuid4
import urllib.parse

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

uploaded_files = []  # [{id, vendor_id, path, original_name}]
UPLOAD_DIR = "uploaded_vendor_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

    original_filename = file.filename
    company_name = vendor["company_name"].replace(" ", "_")
    sanitized_name = f"{company_name}_{original_filename}"
    path = os.path.join(UPLOAD_DIR, sanitized_name)

    with open(path, "wb") as f:
        f.write(file.file.read())

    file_id = str(uuid4())
    uploaded_files.append({
        "id": file_id,
        "vendor_id": vendor_id,
        "path": path,
        "original_name": original_filename
    })

    vendor["file_id"] = file_id  # 마지막 업로드된 파일 기준

    return {"file_id": file_id, "original_name": original_filename}

@router.get("/vendors/{vendor_id}/files")
def list_vendor_files(vendor_id: int):
    vendor = next((v for v in vendors if v["id"] == vendor_id), None)
    if not vendor:
        raise HTTPException(status_code=404, detail="공급업체를 찾을 수 없습니다")

    file_list = [
        {
            "file_id": f["id"],
            "original_name": f["original_name"]
        }
        for f in uploaded_files if f["vendor_id"] == vendor_id
    ]
    return file_list

@router.get("/vendors/{vendor_id}/files/download-all")
def download_all_vendor_files(vendor_id: int):
    matched_files = [f for f in uploaded_files if f["vendor_id"] == vendor_id]
    if not matched_files:
        raise HTTPException(status_code=404, detail="업로드된 파일이 없습니다.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in matched_files:
            print(f"[🧾 파일 경로]: {f['path']}")
            if not os.path.exists(f["path"]):
                print(f"[⚠️ 누락된 파일]: {f['path']}")
                continue
            try:
                zipf.write(f["path"], arcname=f["original_name"])
            except Exception as e:
                print(f"[❌ 압축 실패]: {f['path']} - {e}")
                continue

    zip_buffer.seek(0)
    vendor_name = next((v["company_name"] for v in vendors if v["id"] == vendor_id), "files")
    safe_vendor_name = re.sub(r'[^a-zA-Z0-9가-힣_]', '_', vendor_name)
    zip_filename = f"{safe_vendor_name}_첨부파일.zip"
    encoded_filename = urllib.parse.quote(zip_filename)

    try:
        return StreamingResponse(
            zip_buffer,
            media_type="application/x-zip-compressed",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
            }
        )
    except Exception as e:
        print(f"[❌ ZIP 응답 실패]: {e}")
        raise HTTPException(status_code=500, detail="ZIP 생성 또는 응답 실패")

        
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
        pass  # 이미 삭제된 경우 무시

    uploaded_files = [f for f in uploaded_files if f["id"] != file_id]
    return {"message": "파일이 삭제되었습니다"}