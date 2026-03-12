# /app/routes/ai.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.project import ProjectPlanResponse, RegeneratePlanRequest
from app.services.project_service import ProjectService
from app.services.plan_service import PlanService

router = APIRouter(prefix="/projects", tags=["AI Planning"])


@router.post("/{project_id}/generate-plan", response_model=ProjectPlanResponse)
def generate_plan(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project_service = ProjectService(db)
    project = project_service.get_project(project_id, current_user)
    
    plan_service = PlanService(db)
    project_plan = plan_service.generate_plan(project, current_user)
    
    return project_plan

@router.post("/{project_id}/regenerate-plan", response_model=ProjectPlanResponse)
def regenerate_plan(
    project_id: int,
    data: RegeneratePlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.user import PlanType
    if current_user.plano != PlanType.PRO:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Regeneration requires PRO plan.")

    project_service = ProjectService(db)
    project = project_service.get_project(project_id, current_user)

    # Atualizar título e/ou prazo se fornecidos
    from app.repositories.project_repository import ProjectRepository
    repo = ProjectRepository(db)
    if data.novo_titulo:
        project.nome = data.novo_titulo
    if data.novo_prazo:
        project.prazo = data.novo_prazo
    if data.novo_titulo or data.novo_prazo:
        db.commit()
        db.refresh(project)

    plan_service = PlanService(db)
    return plan_service.generate_plan(project, current_user)
