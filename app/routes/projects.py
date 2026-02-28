# /app/routes/projects.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectWithPlanResponse
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project_service = ProjectService(db)
    return project_service.create_project(current_user, project_data)


@router.get("", response_model=List[ProjectWithPlanResponse])
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project_service = ProjectService(db)
    return project_service.get_user_projects(current_user)


@router.get("/{project_id}", response_model=ProjectWithPlanResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project_service = ProjectService(db)
    return project_service.get_project(project_id, current_user)


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project_service = ProjectService(db)
    project_service.delete_project(project_id, current_user)
    return None