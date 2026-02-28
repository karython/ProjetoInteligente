# /app/repositories/project_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.project import Project, ProjectStatus


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, user_id: int, nome: str, descricao: str, nivel: str, tecnologias: str, prazo: str) -> Project:
        project = Project(
            user_id=user_id,
            nome=nome,
            descricao=descricao,
            nivel=nivel,
            tecnologias=tecnologias,
            prazo=prazo,
            status=ProjectStatus.ATIVO
        )
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project
    
    def get_by_id(self, project_id: int) -> Optional[Project]:
        return self.db.query(Project).filter(Project.id == project_id).first()
    
    def get_by_user(self, user_id: int) -> List[Project]:
        return self.db.query(Project).filter(Project.user_id == user_id).all()
    
    def count_active_by_user(self, user_id: int) -> int:
        return self.db.query(Project).filter(
            and_(
                Project.user_id == user_id,
                Project.status == ProjectStatus.ATIVO
            )
        ).count()
    
    def delete(self, project: Project) -> None:
        self.db.delete(project)
        self.db.commit()