from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import date
from fastapi.responses import FileResponse
from reportlab.pdfgen import canvas
import os
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

router = APIRouter()

# 한글 폰트 등록
pdfmetrics.registerFont(TTFont("Pretendard", "fonts/Pretendard-Regular.ttf"))

class QuotationItem(BaseModel):
    product_name: str
    quantity: int
    unit_price: int

class Quotation(BaseModel):
    client: str
    date: date
    items: List[QuotationItem]

quotations = []

@router.get("/quotations")
def get_quotations():
    return quotations

@router.post("/quotations")
def create_quotation(quotation: Quotation):
    new_id = len(quotations) + 1
    total = sum(item.quantity * item.unit_price for item in quotation.items)

    new_q = {
        "id": new_id,
        "client": quotation.client,
        "date": quotation.date,
        "items": quotation.items,
        "total": total
    }
    quotations.append(new_q)
    return {"message": "견적이 등록되었습니다", "quotation": new_q}

@router.get("/quotations/{quotation_id}/pdf")
def generate_pdf(quotation_id: int):

    # 견적 찾기
    quotation = next((q for q in quotations if q["id"] == quotation_id), None)
    if not quotation:
        raise HTTPException(status_code=404, detail="견적을 찾을 수 없습니다.")

    filename = f"quotation_{quotation_id}.pdf"
    filepath = os.path.join("generated_pdfs", filename)

    os.makedirs("generated_pdfs", exist_ok=True)

    # PDF 생성
    c = canvas.Canvas(filepath)
    c.setFont("Pretendard", 14)
    c.drawString(100, 800, f"견적서 #{quotation_id}")
    c.drawString(100, 780, f"고객명: {quotation['client']}")
    c.drawString(100, 760, f"날짜: {quotation['date']}")
    c.drawString(100, 740, "------------------------------")
    y = 720
    for item in quotation["items"]:
        # 객체라면 dict로 변환
        if hasattr(item, "dict"):
            item = item.dict()

        c.drawString(100, y, f"{item['product_name']} / {item['quantity']}개 / {item['unit_price']}원")
        y -= 20
    c.drawString(100, y - 10, f"총액: {quotation['total']}원")
    c.save()

    return FileResponse(filepath, media_type='application/pdf', filename=filename)