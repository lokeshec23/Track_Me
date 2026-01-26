from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TransactionSchema(BaseModel):
    user_id: str = Field(...)
    amount: float = Field(...)
    description: Optional[str] = None
    categoryId: str = Field(...) # Changed to categoryId to match frontend
    date: str = Field(...)
    type: str = Field(...) # "income" or "expense"
    paymentMode: Optional[str] = "UPI"

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "amount": 100.0,
                "description": "Groceries",
                "categoryId": "123",
                "date": "2023-10-27",
                "type": "expense",
                "paymentMode": "UPI"
            }
        }

class CreateTransactionSchema(BaseModel):
    amount: float = Field(...)
    description: Optional[str] = None
    categoryId: str = Field(...)
    date: str = Field(...)
    type: str = Field(...)
    paymentMode: Optional[str] = "UPI"
