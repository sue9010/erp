from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Product(BaseModel):
    category: str
    name: str
    manufacturer: str
    price: int
    stock: int
    note: str

class BulkProductCreate(BaseModel):
    products: List[Product]

products = [
    {"id": 1, "category":"열화상 카메라","name": "열화상 카메라 모듈", "manufacturer": "ThermoCorp", "price": 1200000, "stock": 100, "note": "싸가지"},
    {"id": 2, "category":"렌즈","name": "렌즈 키트", "manufacturer": "LensPro", "price": 300000, "stock": 50, "note": "왕재수"}
]

def get_max_id():
    return max(p["id"] for p in products) if products else 0

def find_product_by_name_and_manufacturer(name: str, manufacturer: str):
    return next((p for p in products if p["name"] == name and p["manufacturer"] == manufacturer), None)

@router.get("/products")
def get_products():
    return products

@router.post("/products")
def add_product(product: Product):
    if find_product_by_name_and_manufacturer(product.name, product.manufacturer):
        raise HTTPException(status_code=400, detail="동일한 제조사의 제품명이 이미 존재합니다")
    
    new_id = get_max_id() + 1
    new_product = {"id": new_id, **product.dict()}
    products.append(new_product)
    return {"message": "제품이 추가되었습니다", "product": new_product}

@router.put("/products/{product_id}")
def update_product(product_id: int, product: Product):
    for i, p in enumerate(products):
        if p["id"] == product_id:
            if (product.name != p["name"] or product.manufacturer != p["manufacturer"]) and \
                find_product_by_name_and_manufacturer(product.name, product.manufacturer):
                raise HTTPException(status_code=400, detail="제품명/제조사 조합 중복")
                
            products[i] = {**p, **product.dict(), "id": product_id}
            return {"message": "제품 수정 성공"}
    raise HTTPException(status_code=404, detail="제품 없음")

@router.post("/products/bulk")
def add_bulk_products(bulk_product: BulkProductCreate):
    current_max_id = get_max_id()
    new_products = []
    errors = []

    for idx, product in enumerate(bulk_product.products):
        new_id = current_max_id + idx + 1
        if find_product_by_name_and_manufacturer(product.name, product.manufacturer):
            errors.append(f"제품 {product.name} ({product.manufacturer}) 중복")
            continue
            
        new_products.append({"id": new_id, **product.dict()})
    
    products.extend(new_products)
    return {"message": f"{len(new_products)}개 제품 추가", "errors": errors}

@router.delete("/products/{product_id}")
def delete_product(product_id: int):
    global products
    initial_count = len(products)
    products = [p for p in products if p["id"] != product_id]
    if len(products) == initial_count:
        raise HTTPException(status_code=404, detail="제품 없음")
    return {"message": "제품 삭제 완료"}
