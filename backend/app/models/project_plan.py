# /app/models/project_plan.py
from sqlalchemy import Column, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class ProjectPlan(Base):
    __tablename__ = "project_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    backlog = Column(JSON, nullable=False)
    estrutura_pastas = Column(JSON, nullable=False)
    checklist_tecnico = Column(JSON, nullable=False)
    sequencia_desenvolvimento = Column(JSON, nullable=False)
    cronograma_sugerido = Column(JSON, nullable=False)
    
    project = relationship("Project", back_populates="plan")