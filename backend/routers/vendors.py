from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel
import pandas as pd
from io import BytesIO

router = APIRouter()

# 업체 데이터 구조 정의
class Vendor(BaseModel):
    name: str
    contact: str

vendors = [
    {"id": 1, "name": "삼성전자", "contact": "010-1234-5678"},
    {"id": 2, "name": "LG전자", "contact": "010-9876-5432"}
]

@router.get("/vendors")
def get_vendors():
    return vendors

@router.post("/vendors")
def add_vendor(vendor: Vendor):
    new_id = len(vendors) + 1
    new_vendor = {
        "id": new_id,
        "name": vendor.name,
        "contact": vendor.contact
    }
    vendors.append(new_vendor)
    return {"message": "업체가 추가되었습니다", "vendor": new_vendor}

@router.post("/vendors/upload_excel")
async def upload_excel(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_excel(BytesIO(content), engine="openpyxl")

    for _, row in df.iterrows():
        new_id = len(vendors) + 1
        new_vendor = {
            "id": new_id,
            "name": row["name"],
            "contact": row["contact"]
        }
        vendors.append(new_vendor)

    return {"message": "엑셀에서 업체들이 등록되었습니다!", "count": len(df)}