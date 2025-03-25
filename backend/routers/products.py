# backend/routers/products.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# 제품 데이터 구조
class Product(BaseModel):
    name: str
    manufacturer: str
    price: int

# 메모리 기반 제품 리스트
products = [
    {"id": 1, "name": "열화상 카메라 모듈", "manufacturer": "ThermoCorp", "price": 1200000},
    {"id": 2, "name": "렌즈 키트", "manufacturer": "LensPro", "price": 300000}
]

@router.get("/products")
def get_products():
    return products

@router.post("/products")
def add_product(product: Product):
    new_id = len(products) + 1
    new_product = {
        "id": new_id,
        "name": product.name,
        "manufacturer": product.manufacturer,
        "price": product.price
    }
    products.append(new_product)
    return {"message": "제품이 추가되었습니다", "product": new_product}
