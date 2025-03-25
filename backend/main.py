# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import vendors,products , quotations, orders, stock_history, purchases, payments, productions, shipments
from dotenv import load_dotenv
import asyncio
import os
from utils.email_sender import send_email_with_pdf_sync

load_dotenv()

app = FastAPI()

# CORS 설정 (React 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 전체 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(vendors.router)
app.include_router(products.router)
app.include_router(quotations.router) 
app.include_router(orders.router)
app.include_router(stock_history.router)
app.include_router(purchases.router)
app.include_router(payments.router)
app.include_router(productions.router)
app.include_router(shipments.router)

@app.get("/")
def read_root():
    return {"message": "Hello ERP World!"}

@app.get("/test-email")
def test_email():
    send_email_with_pdf_sync(
        to_email="sue@coxcamera.com",
        subject="테스트 메일 (smtplib)",
        body="smtplib 방식으로 보낸 메일입니다.",
        pdf_path="generated_pdfs/quotation_1.pdf"
    )
    return {"message": "📧 동기 방식으로 이메일 전송 시도 완료"}