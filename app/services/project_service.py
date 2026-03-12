# /app/services/project_service.py
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User, PlanType, SubscriptionStatus
from app.models.project import Project, ProjectStatus
from app.repositories.project_repository import ProjectRepository
from app.repositories.project_plan_repository import ProjectPlanRepository
from app.repositories.user_repository import UserRepository
from app.schemas.project import ProjectCreate, ProjectProgressUpdate

FREE_PROJECT_LIMIT = 2


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.project_repo = ProjectRepository(db)
        self.plan_repo = ProjectPlanRepository(db)
        self.user_repo = UserRepository(db)

    # ------------------------------------------------------------------ #
    # Helpers de assinatura                                                 #
    # ------------------------------------------------------------------ #

    def _sync_subscription_status(self, user: User) -> None:
        """Verifica se o prazo de carência expirou e faz downgrade automático."""
        if (
            user.subscription_status == SubscriptionStatus.OVERDUE
            and user.grace_period_end
            and datetime.utcnow() >= user.grace_period_end
        ):
            self.user_repo.downgrade_to_free(user)
            self.db.refresh(user)

    def _is_subscription_blocking(self, user: User) -> bool:
        """
        Retorna True quando o usuário está em OVERDUE/EXPIRED e o prazo de 30
        dias já expirou — ou seja, deve ser tratado como plano FREE.
        """
        if user.plano == PlanType.FREE:
            return False
        if user.subscription_status in (SubscriptionStatus.ACTIVE, SubscriptionStatus.INACTIVE):
            return False
        # OVERDUE: dentro do prazo ainda pode usar, mas após o prazo bloqueia
        if user.subscription_status == SubscriptionStatus.OVERDUE:
            if user.grace_period_end and datetime.utcnow() >= user.grace_period_end:
                return True
            return False
        return True

    def _user_is_effectively_free(self, user: User) -> bool:
        """Usuário deve ser tratado como plano FREE?"""
        return user.plano == PlanType.FREE or self._is_subscription_blocking(user)

    # ------------------------------------------------------------------ #
    # CRUD de projetos                                                      #
    # ------------------------------------------------------------------ #

    def create_project(self, user: User, project_data: ProjectCreate) -> Project:
        self._sync_subscription_status(user)
        active_projects_count = self.project_repo.count_active_by_user(user.id)

        if self._user_is_effectively_free(user) and active_projects_count >= FREE_PROJECT_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Limite do plano gratuito atingido. Máximo de 2 projetos ativos permitidos.",
            )

        return self.project_repo.create(
            user_id=user.id,
            nome=project_data.nome,
            descricao=project_data.descricao,
            nivel=project_data.nivel,
            tecnologias=project_data.tecnologias,
            prazo=project_data.prazo,
        )

    def get_user_projects(self, user: User) -> List[Project]:
        return self.project_repo.get_by_user(user.id)

    def get_project(self, project_id: int, user: User) -> Project:
        self._sync_subscription_status(user)
        project = self.project_repo.get_by_id(project_id)

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Projeto não encontrado.",
            )

        if project.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar este projeto.",
            )

        # Usuários em plano efetivamente FREE só podem abrir os 2 primeiros projetos
        if self._user_is_effectively_free(user):
            user_projects = self.project_repo.get_by_user(user.id)
            # Ordena por data de criação para determinar quais são os 2 permitidos
            allowed_ids = {
                p.id for p in sorted(user_projects, key=lambda p: p.data_criacao)[:FREE_PROJECT_LIMIT]
            }
            if project_id not in allowed_ids:
                grace_msg = ""
                if user.subscription_status == SubscriptionStatus.OVERDUE and user.grace_period_end:
                    grace_msg = (
                        f" Regularize até {user.grace_period_end.strftime('%d/%m/%Y')} "
                        "para recuperar o acesso completo."
                    )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "Acesso bloqueado. Você está no plano gratuito (máximo 2 projetos)."
                        + grace_msg
                    ),
                )

        return project

    def update_progress(self, project_id: int, user: User, data: ProjectProgressUpdate) -> Project:
        # get_project já aplica as verificações de assinatura
        project = self.get_project(project_id, user)

        plan = self.plan_repo.get_by_project(project_id)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plano do projeto não encontrado.",
            )

        self.plan_repo.update_backlog(plan, data.backlog)

        tarefas = data.backlog.get("tarefas", [])
        if tarefas and all(t.get("feito") for t in tarefas):
            self.project_repo.update_status(project, ProjectStatus.CONCLUIDO)
        elif project.status == ProjectStatus.CONCLUIDO:
            self.project_repo.update_status(project, ProjectStatus.ATIVO)

        self.db.refresh(project)
        return project

    def delete_project(self, project_id: int, user: User) -> None:
        project = self.get_project(project_id, user)
        self.project_repo.delete(project)