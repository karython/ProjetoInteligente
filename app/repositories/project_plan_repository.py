# /app/repositories/project_plan_repository.py
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.project_plan import ProjectPlan


class ProjectPlanRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(
        self,
        project_id: int,
        backlog: Dict[str, Any],
        estrutura_pastas: Dict[str, Any],
        checklist_tecnico: Dict[str, Any],
        sequencia_desenvolvimento: Dict[str, Any],
        cronograma_sugerido: Dict[str, Any]
    ) -> ProjectPlan:
        plan = ProjectPlan(
            project_id=project_id,
            backlog=backlog,
            estrutura_pastas=estrutura_pastas,
            checklist_tecnico=checklist_tecnico,
            sequencia_desenvolvimento=sequencia_desenvolvimento,
            cronograma_sugerido=cronograma_sugerido
        )
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan
    
    def get_by_project(self, project_id: int) -> Optional[ProjectPlan]:
        return self.db.query(ProjectPlan).filter(ProjectPlan.project_id == project_id).first()
    
    def delete(self, plan: ProjectPlan) -> None:
        self.db.delete(plan)
        self.db.commit()
    
    def count_by_project(self, project_id: int) -> int:
        return self.db.query(ProjectPlan).filter(ProjectPlan.project_id == project_id).count()