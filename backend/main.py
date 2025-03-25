# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import vendors,products 

app = FastAPI()

# CORS 설정 (React 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 전체 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello ERP World!"}

# 라우터 등록
app.include_router(vendors.router)
app.include_router(products.router)
