# backend/routers/purchases.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime

from routers.products import products
from routers.stock_history import stock_history

router = APIRouter()

class PurchaseItem(BaseModel):
    product_name: str
    quantity: int

class Purchase(BaseModel):
    vendor: str
    items: List[PurchaseItem]

purchases = []

@router.get("/purchases")
def get_purchases():
    return purchases

@router.post("/purchases")
def create_purchase(purchase: Purchase):
    new_id = len(purchases) + 1

    for item in purchase.items:
        matched_product = next((p for p in products if p["name"] == item.product_name), None)
        if not matched_product:
            raise HTTPException(status_code=404, detail=f"제품 '{item.product_name}'을 찾을 수 없습니다.")
        matched_product["stock"] += item.quantity

        # 입고 이력 기록
        stock_history.append({
            "timestamp": datetime.now().isoformat(),
            "product_name": item.product_name,
            "quantity": item.quantity,
            "type": "입고",
            "source": f"구매: {purchase.vendor}"
        })

    new_purchase = {
        "id": new_id,
        "vendor": purchase.vendor,
        "items": purchase.items
    }

    purchases.append(new_purchase)
    return {"message": "입고 처리 완료", "purchase": new_purchase}
