# /app/models/project.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class ProjectStatus(str, enum.Enum):
    ATIVO = "ATIVO"
    CONCLUIDO = "CONCLUIDO"
    CANCELADO = "CANCELADO"


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nome = Column(String, nullable=False)
    descricao = Column(Text, nullable=False)
    nivel = Column(String, nullable=False)
    tecnologias = Column(Text, nullable=False)
    prazo = Column(String, nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.ATIVO, nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    user = relationship("User", back_populates="projects")
    plan = relationship("ProjectPlan", back_populates="project", uselist=False, cascade="all, delete-orphan")