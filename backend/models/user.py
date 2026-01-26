from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class BankInfoSchema(BaseModel):
    bankName: str
    accountNumber: str
    ifscCode: str
    branchName: str

class CardSchema(BaseModel):
    lastFourDigits: str
    cardHolder: str
    expiry: str
    creditLimit: Optional[float] = None

class OnboardingSchema(BaseModel):
    employeeId: str
    department: str
    designation: str
    bankInfo: BankInfoSchema
    debitCard: CardSchema
    creditCard: CardSchema


class UserSchema(BaseModel):
    username: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    is_onboarded: bool = False
    onboarding_data: Optional[OnboardingSchema] = None
    theme: str = 'light'



    class Config:
        json_schema_extra = {
            "example": {
                "username": "user123",
                "email": "user@example.com",
                "password": "securepassword"
            }
        }

class UserLoginSchema(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword"
            }
        }

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
