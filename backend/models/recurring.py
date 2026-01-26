from pydantic import BaseModel, Field
from typing import Optional

class RecurringSchema(BaseModel):
    user_id: str = Field(...)
    type: str = Field(...)
    amount: float = Field(...)
    categoryId: str = Field(...)
    description: Optional[str] = ""
    frequency: str = Field(...) # daily, weekly, monthly, yearly
    startDate: str = Field(...)
    endDate: Optional[str] = None
    lastGenerated: Optional[str] = None
    isActive: bool = Field(default=True)
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class CreateRecurringSchema(BaseModel):
    type: str = Field(...)
    amount: float = Field(...)
    categoryId: str = Field(...)
    description: Optional[str] = ""
    frequency: str = Field(...)
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    isActive: Optional[bool] = True
