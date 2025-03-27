from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
from typing import List

router = APIRouter()

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
    note: str = ""  # 기본값 설정

class BulkVendorCreate(BaseModel):
    vendors: List[Vendor]

vendors = [
    {"id": 1, "company_name":"COX","contact_person": "David", "contact": "010-1234-5678", "country":"대한민국","address": "서울시 강남구",
    "export_license_required":"불필요","export_license_type":"해당 없음","export_license_number":"해당 없음","shipping_method":"택배","shipping_account":"COX", "note": "우수 공급업체"},
]


def get_max_id():
    return max(v["id"] for v in vendors) if vendors else 0

@router.get("/vendors")
def get_vendors():
    return vendors

@router.post("/vendors")
def add_vendor(vendor: Vendor):
    # ✅ company_name 기준 중복 체크
    if any(v["company_name"] == vendor.company_name for v in vendors):
        raise HTTPException(status_code=400, detail="중복된 공급업체 이름이 존재합니다")
    
    new_id = get_max_id() + 1
    new_vendor = {"id": new_id, **vendor.dict()}
    vendors.append(new_vendor)
    return {"message": "공급업체가 추가되었습니다", "vendor": new_vendor}

@router.post("/vendors/bulk")
def add_bulk_vendors(bulk_vendor: BulkVendorCreate):
    current_max_id = get_max_id()
    new_vendors = []
    errors = []

    for idx, vendor in enumerate(bulk_vendor.vendors):
        # ✅ company_name 필드 사용
        if any(v["company_name"] == vendor.company_name for v in vendors):
            errors.append(f"공급업체 이름 '{vendor.company_name}'이(가) 중복됩니다.")
            continue

        new_id = current_max_id + idx + 1
        new_vendor = {"id": new_id, **vendor.dict()}
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
