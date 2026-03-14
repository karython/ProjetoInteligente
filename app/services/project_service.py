# /app/services/project_service.py
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User, PlanType
from app.models.project import Project, ProjectStatus
from app.repositories.project_repository import ProjectRepository
from app.repositories.project_plan_repository import ProjectPlanRepository
from app.schemas.project import ProjectCreate, ProjectProgressUpdate


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.project_repo = ProjectRepository(db)
        self.plan_repo = ProjectPlanRepository(db)

    def create_project(self, user: User, project_data: ProjectCreate) -> Project:
        active_projects_count = self.project_repo.count_active_by_user(user.id)

        if user.plano == PlanType.FREE and active_projects_count >= 2:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free plan limit reached. Maximum 2 active projects allowed.",
            )

        return self.project_repo.create(
            user_id=user.id,
            nome=project_data.nome,
            descricao=project_data.descricao,
            nivel=project_data.nivel,
            tecnologias=project_data.tecnologias,
            prazo=project_data.prazo,
            tipo_cronograma=project_data.tipo_cronograma,
        )

    def get_user_projects(self, user: User) -> List[Project]:
        return self.project_repo.get_by_user(user.id)

    def get_project(self, project_id: int, user: User) -> Project:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        if project.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return project

    def update_progress(self, project_id: int, user: User, data: ProjectProgressUpdate) -> Project:
        project = self.get_project(project_id, user)

        plan = self.plan_repo.get_by_project(project_id)
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project plan not found")

        # Persiste backlog e checklist atualizados no plano
        self.plan_repo.update_plan(plan, data.backlog, data.checklist_tecnico)

        # Calcula progresso real a partir das user_stories do backlog recebido
        all_stories = [
            story
            for epico in data.backlog.get("epicos", [])
            for story in epico.get("user_stories", [])
        ]

        if all_stories:
            completed = sum(1 for s in all_stories if s.get("completed", False))
            progresso = round(completed / len(all_stories) * 100)
        else:
            progresso = 0

        # Persiste o progresso calculado na tabela projects
        self.project_repo.update_progresso(project, progresso)

        # Atualiza status automaticamente com base no progresso
        if progresso == 100:
            self.project_repo.update_status(project, ProjectStatus.CONCLUIDO)
        elif project.status == ProjectStatus.CONCLUIDO:
            # Desmarcou uma story — volta para ativo
            self.project_repo.update_status(project, ProjectStatus.ATIVO)

        self.db.refresh(project)
        return project

    def delete_project(self, project_id: int, user: User) -> None:
        project = self.get_project(project_id, user)
        self.project_repo.delete(project)