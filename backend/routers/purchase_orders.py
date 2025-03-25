# backend/routers/purchase_orders.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import date

router = APIRouter()

class PurchaseOrderItem(BaseModel):
    product_name: str
    quantity: int

class PurchaseOrder(BaseModel):
    vendor: str
    order_date: date
    items: List[PurchaseOrderItem]

purchase_orders = []

@router.get("/purchase-orders")
def get_purchase_orders():
    return purchase_orders

@router.post("/purchase-orders")
def create_purchase_order(po: PurchaseOrder):
    new_id = len(purchase_orders) + 1
    new_record = {
        "id": new_id,
        **po.dict()
    }
    purchase_orders.append(new_record)
    return {"message": "발주 등록 완료", "purchase_order": new_record}
