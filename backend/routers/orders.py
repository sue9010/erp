# backend/routers/orders.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from routers.products import products
from routers.stock_history import stock_history
from datetime import datetime

router = APIRouter()

class OrderItem(BaseModel):
    product_name: str
    quantity: int

class Order(BaseModel):
    customer: str
    items: List[OrderItem]

orders = []

@router.get("/orders")
def get_orders():
    return orders

@router.post("/orders")
def create_order(order: Order):
    new_id = len(orders) + 1

    # ✅ 재고 부족 검사
    for item in order.items:
        matched_product = next((p for p in products if p["name"] == item.product_name), None)
        if not matched_product:
            raise HTTPException(status_code=404, detail=f"제품 '{item.product_name}'을 찾을 수 없습니다.")
        if matched_product.get("stock", 0) < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"'{item.product_name}' 재고 부족: 남은 수량 {matched_product.get('stock', 0)}개"
            )

    # ✅ 재고 차감 및 출고 이력 기록
    for item in order.items:
        for p in products:
            if p["name"] == item.product_name:
                p["stock"] -= item.quantity

                # 출고 이력 추가
                stock_history.append({
                    "timestamp": datetime.now().isoformat(),
                    "product_name": item.product_name,
                    "quantity": -item.quantity,
                    "type": "출고",
                    "source": f"주문: {order.customer}"
                })

    new_order = {
        "id": new_id,
        "customer": order.customer,
        "items": order.items
    }

    orders.append(new_order)
    return {"message": "주문 등록 완료", "order": new_order}
