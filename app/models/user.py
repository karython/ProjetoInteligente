# /app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class PlanType(str, enum.Enum):
    FREE = "FREE"
    PRO = "PRO"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    plano = Column(Enum(PlanType), default=PlanType.FREE, nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")