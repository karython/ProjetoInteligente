# /app/services/project_service.py

from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User, PlanType
from app.models.project import Project, ProjectStatus
from app.repositories.project_repository import ProjectRepository
from app.repositories.project_plan_repository import ProjectPlanRepository
from app.schemas.project import ProjectCreate, ProjectProgressUpdate


# Limites por plano (fácil expansão futuramente)
PLAN_LIMITS = {
    PlanType.FREE: {
        "max_projects": 2,
    },
    PlanType.PRO: {
        "max_projects": None,  # ilimitado
    },
}


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.project_repo = ProjectRepository(db)
        self.plan_repo = ProjectPlanRepository(db)

    # ==============================
    # VERIFICAÇÃO DE LIMITE DE PLANO
    # ==============================

    def _check_project_limit(self, user: User):

        limits = PLAN_LIMITS.get(user.plano)

        if not limits:
            return

        max_projects = limits.get("max_projects")

        # plano ilimitado
        if max_projects is None:
            return

        current_projects = self.project_repo.count_by_user(user.id)

        if current_projects >= max_projects:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "PLAN_LIMIT_REACHED",
                    "message": f"Seu plano permite apenas {max_projects} projetos.",
                    "limit": max_projects,
                    "upgrade_required": True,
                },
            )

    # ==============================
    # CRIAR PROJETO
    # ==============================

    def create_project(self, user: User, project_data: ProjectCreate) -> Project:

        # verifica limite do plano
        self._check_project_limit(user)

        project = self.project_repo.create(
            user_id=user.id,
            nome=project_data.nome,
            descricao=project_data.descricao,
            nivel=project_data.nivel,
            tecnologias=project_data.tecnologias,
            prazo=project_data.prazo,
            tipo_cronograma=project_data.tipo_cronograma,
        )

        return project

    # ==============================
    # LISTAR PROJETOS DO USUÁRIO
    # ==============================

    def get_user_projects(self, user: User) -> List[Project]:
        return self.project_repo.get_by_user(user.id)

    # ==============================
    # BUSCAR PROJETO
    # ==============================

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
                detail="Not authorized"
            )

        return project

    # ==============================
    # ATUALIZAR PROGRESSO
    # ==============================

    def update_progress(
        self,
        project_id: int,
        user: User,
        data: ProjectProgressUpdate
    ) -> Project:

        project = self.get_project(project_id, user)

        plan = self.plan_repo.get_by_project(project_id)

        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project plan not found"
            )

        # salva backlog atualizado
        self.plan_repo.update_plan(
            plan,
            data.backlog,
            data.checklist_tecnico
        )

        # calcula progresso
        all_stories = [
            story
            for epico in data.backlog.get("epicos", [])
            for story in epico.get("user_stories", [])
        ]

        if all_stories:
            completed = sum(
                1 for s in all_stories if s.get("completed", False)
            )
            progresso = round(completed / len(all_stories) * 100)
        else:
            progresso = 0

        # salva progresso
        self.project_repo.update_progresso(project, progresso)

        # atualiza status automaticamente
        if progresso == 100:
            self.project_repo.update_status(
                project,
                ProjectStatus.CONCLUIDO
            )

        elif project.status == ProjectStatus.CONCLUIDO:
            self.project_repo.update_status(
                project,
                ProjectStatus.ATIVO
            )

        self.db.refresh(project)

        return project

    # ==============================
    # DELETAR PROJETO
    # ==============================

    def delete_project(self, project_id: int, user: User) -> None:

        project = self.get_project(project_id, user)

        self.project_repo.delete(project)