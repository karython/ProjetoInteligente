# /app/schemas/project.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List


class ProjectCreate(BaseModel):
    nome: str
    descricao: str
    nivel: str
    tecnologias: str
    prazo: str


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    nome: str
    descricao: str
    nivel: str
    tecnologias: str
    prazo: str
    status: str
    data_criacao: datetime
    
    class Config:
        from_attributes = True


class ProjectPlanResponse(BaseModel):
    id: int
    project_id: int
    backlog: Dict[str, Any]
    estrutura_pastas: Dict[str, Any]
    checklist_tecnico: Dict[str, Any]
    sequencia_desenvolvimento: Dict[str, Any]
    cronograma_sugerido: Dict[str, Any]
    
    class Config:
        from_attributes = True


class ProjectWithPlanResponse(ProjectResponse):
    plan: Optional[ProjectPlanResponse] = None