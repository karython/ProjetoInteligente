# /app/services/project_service.py
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User, PlanType
from app.models.project import Project
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.project_repo = ProjectRepository(db)
    
    def create_project(self, user: User, project_data: ProjectCreate) -> Project:
        active_projects_count = self.project_repo.count_active_by_user(user.id)
        
        if user.plano == PlanType.FREE and active_projects_count >= 2:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free plan limit reached. Maximum 2 active projects allowed."
            )
        
        project = self.project_repo.create(
            user_id=user.id,
            nome=project_data.nome,
            descricao=project_data.descricao,
            nivel=project_data.nivel,
            tecnologias=project_data.tecnologias,
            prazo=project_data.prazo
        )
        
        return project
    
    def get_user_projects(self, user: User) -> List[Project]:
        return self.project_repo.get_by_user(user.id)
    
    def get_project(self, project_id: int, user: User) -> Project:
        project = self.project_repo.get_by_id(project_id)
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        if project.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this project"
            )
        
        return project
    
    def delete_project(self, project_id: int, user: User) -> None:
        project = self.get_project(project_id, user)
        self.project_repo.delete(project)