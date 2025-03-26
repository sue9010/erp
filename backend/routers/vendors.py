from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Vendor(BaseModel):
    name: str
    contact: str
    address: str
    note: str

class BulkVendorCreate(BaseModel):
    vendors: List[Vendor]

vendors = [
    {"id": 1, "name": "Vendor A", "contact": "010-1234-5678", "address": "서울시 강남구", "note": "우수 공급업체"},
    {"id": 2, "name": "Vendor B", "contact": "010-9876-5432", "address": "부산시 해운대구", "note": "신규 공급업체"}
]

def get_max_id():
    return max(v["id"] for v in vendors) if vendors else 0

@router.get("/vendors")
def get_vendors():
    return vendors

@router.post("/vendors")
def add_vendor(vendor: Vendor):
    if any(v["name"] == vendor.name for v in vendors):
        raise HTTPException(status_code=400, detail="중복된 공급업체 이름이 존재합니다")
    
    new_id = get_max_id() + 1
    new_vendor = {"id": new_id, **vendor.dict()}
    vendors.append(new_vendor)
    return {"message": "공급업체가 추가되었습니다", "vendor": new_vendor}

@router.put("/vendors/{vendor_id}")
def update_vendor(vendor_id: int, vendor: Vendor):
    for i, v in enumerate(vendors):
        if v["id"] == vendor_id:
            vendors[i] = {**v, **vendor.dict(), "id": vendor_id}
            return {"message": "공급업체가 수정되었습니다"}
    raise HTTPException(status_code=404, detail="공급업체를 찾을 수 없습니다")

@router.delete("/vendors/{vendor_id}")
def delete_vendor(vendor_id: int):
    global vendors
    initial_length = len(vendors)
    vendors = [v for v in vendors if v["id"] != vendor_id]
    
    if len(vendors) == initial_length:
        raise HTTPException(status_code=404, detail="공급업체를 찾을 수 없습니다")
    return {"message": "공급업체가 삭제되었습니다"}

@router.post("/vendors/bulk")
def add_bulk_vendors(bulk_vendor: BulkVendorCreate):
    current_max_id = get_max_id()
    new_vendors = []
    errors = []

    for idx, vendor in enumerate(bulk_vendor.vendors):
        if any(v["name"] == vendor.name for v in vendors):
            errors.append(f"공급업체 이름 '{vendor.name}'이(가) 중복됩니다.")
            continue

        new_id = current_max_id + idx + 1
        new_vendor = {"id": new_id, **vendor.dict()}
        new_vendors.append(new_vendor)

    vendors.extend(new_vendors)

    if errors:
        return {"message": "일부 공급업체 추가 실패", "errors": errors, "added": len(new_vendors)}

    return {"message": f"{len(new_vendors)}개의 공급업체가 추가되었습니다", "added": len(new_vendors)}