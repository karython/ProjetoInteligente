# /app/schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str


class UserLogin(BaseModel):
    email: EmailStr
    senha: str


class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    plano: str
    data_criacao: datetime
    subscription_status: Optional[str] = None
    subscription_due_date: Optional[datetime] = None
    grace_period_end: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    nome: str
    email: EmailStr


class PasswordChange(BaseModel):
    senha_atual: str
    nova_senha: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None