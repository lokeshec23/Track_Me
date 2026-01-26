from pydantic import BaseModel, Field
from typing import Optional

class CategorySchema(BaseModel):
    user_id: str = Field(...)
    name: str = Field(...)
    icon: str = Field(...)
    color: str = Field(...)
    type: str = Field(...) # 'expense' or 'income'
    isCustom: bool = Field(default=True)

class CreateCategorySchema(BaseModel):
    name: str = Field(...)
    icon: str = Field(...)
    color: str = Field(...)
    type: str = Field(...) # 'expense' or 'income'
    isCustom: Optional[bool] = True
