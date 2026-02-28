# /app/repositories/user_repository.py
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User, PlanType


class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
    
    def create(self, nome: str, email: str, senha_hash: str) -> User:
        user = User(
            nome=nome,
            email=email,
            senha_hash=senha_hash,
            plano=PlanType.FREE
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user