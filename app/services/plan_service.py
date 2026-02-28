# /app/services/plan_service.py
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User, PlanType
from app.models.project import Project
from app.models.project_plan import ProjectPlan
from app.repositories.project_plan_repository import ProjectPlanRepository
from app.ai.ai_service import AIService


class PlanService:
    def __init__(self, db: Session):
        self.db = db
        self.plan_repo = ProjectPlanRepository(db)
        self.ai_service = AIService()
    
    def generate_plan(self, project: Project, user: User) -> ProjectPlan:
        existing_plan_count = self.plan_repo.count_by_project(project.id)
        
        if user.plano == PlanType.FREE and existing_plan_count >= 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free plan allows only 1 generation per project. Upgrade to PRO for unlimited regenerations."
            )
        
        existing_plan = self.plan_repo.get_by_project(project.id)
        if existing_plan:
            self.plan_repo.delete(existing_plan)
        
        plan_data = self.ai_service.generate_project_plan(
            nome=project.nome,
            descricao=project.descricao,
            nivel=project.nivel,
            tecnologias=project.tecnologias,
            prazo=project.prazo
        )
        
        project_plan = self.plan_repo.create(
            project_id=project.id,
            backlog=plan_data["backlog"],
            estrutura_pastas=plan_data["estrutura_pastas"],
            checklist_tecnico=plan_data["checklist_tecnico"],
            sequencia_desenvolvimento=plan_data["sequencia_desenvolvimento"],
            cronograma_sugerido=plan_data["cronograma_sugerido"]
        )
        
        return project_plan