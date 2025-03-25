# backend/routers/stock_history.py
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

stock_history = []

@router.get("/stock_history")
def get_history():
    return stock_history
