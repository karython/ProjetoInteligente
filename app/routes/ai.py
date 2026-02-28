# /app/routes/ai.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.project import ProjectPlanResponse
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