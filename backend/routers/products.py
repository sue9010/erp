# backend/routers/products.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

# 제품 데이터 구조
class Product(BaseModel):
    category: str
    name: str
    manufacturer: str
    price: int
    stock: int
    note: str

class BulkProductCreate(BaseModel):
    products: List[Product]

# 메모리 기반 제품 리스트
products = [
    {"id": 1, "category":"열화상 카메라","name": "열화상 카메라 모듈", "manufacturer": "ThermoCorp", "price": 1200000, "stock": 100, "note": "싸가지"},
    {"id": 2, "category":"렌즈","name": "렌즈 키트", "manufacturer": "LensPro", "price": 300000, "stock": 50, "note": "왕재수"}
]


@router.get("/products")
def get_products():
    return products

@router.post("/products")
def add_product(product: Product):
    new_id = len(products) + 1
    new_product = {
        "id": new_id,
        "category": product.category,
        "name": product.name,
        "manufacturer": product.manufacturer,
        "price": product.price,
        "stock": product.stock,
        "note" : product.note
    }
    products.append(new_product)
    return {"message": "제품이 추가되었습니다", "product": new_product}

@router.post("/products/bulk")
def add_bulk_products(bulk_product: BulkProductCreate):
    new_products = []
    for product in bulk_product.products:
        new_id = len(products) + 1
        new_product = {
            "id": new_id,
            "category": product.category,
            "name": product.name,
            "manufacturer": product.manufacturer,
            "price": product.price,
            "stock": product.stock,
            "note": product.note
        }
        products.append(new_product)
        new_products.append(new_product)
    return {"message": f"{len(new_products)}개의 제품이 추가되었습니다", "products": new_products}

@router.put("/products/{product_id}")
def update_product(product_id: int, product: Product):
    for i, p in enumerate(products):
        if p["id"] == product_id:
            products[i] = {**p, **product.dict(), "id": product_id}
            return {"message": "제품이 수정되었습니다."}
    raise HTTPException(status_code=404, detail="제품을 찾을 수 없습니다.")



@router.delete("/products/{product_id}")
def delete_product(product_id: int):
    product = next((p for p in products if p["id"] == product_id), None)
    if product:
        products.remove(product)
        return {"message": "제품이 삭제되었습니다."}
    raise HTTPException(status_code=404, detail="제품을 찾을 수 없습니다.")
