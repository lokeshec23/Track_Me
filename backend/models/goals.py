from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class GoalSchema(BaseModel):
    user_id: str = Field(...)
    name: str = Field(...)
    targetAmount: float = Field(...)
    currentAmount: float = Field(default=0.0)
    deadline: Optional[str] = None
    category: str = Field(default="other")
    icon: str = Field(default="🎯")
    color: str = Field(default="#6366f1")
    isCompleted: bool = Field(default=False)
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    completedAt: Optional[str] = None

class CreateGoalSchema(BaseModel):
    name: str = Field(...)
    targetAmount: float = Field(...)
    currentAmount: float = Field(default=0.0)
    deadline: Optional[str] = None
    category: Optional[str] = "other"
    icon: Optional[str] = "🎯"
    color: Optional[str] = "#6366f1"
