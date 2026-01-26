from pydantic import BaseModel, Field
from typing import Optional

class BudgetSchema(BaseModel):
    user_id: str = Field(...)
    categoryId: str = Field(...) # 'overall' or specific category ID
    amount: float = Field(...)
    period: str = Field(default="monthly") # 'monthly' or 'yearly'
    startDate: str = Field(...)
    alertThreshold: int = Field(default=80)
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class CreateBudgetSchema(BaseModel):
    categoryId: str = Field(...)
    amount: float = Field(...)
    period: Optional[str] = "monthly"
    startDate: Optional[str] = None
    alertThreshold: Optional[int] = 80
