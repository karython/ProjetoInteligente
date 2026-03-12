# /app/repositories/user_repository.py
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User, PlanType, SubscriptionStatus


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
            plano=PlanType.FREE,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, nome: str, email: str) -> User:
        user.nome = nome
        user.email = email
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_password(self, user: User, senha_hash: str) -> User:
        user.senha_hash = senha_hash
        self.db.commit()
        self.db.refresh(user)
        return user

    # ------------------------------------------------------------------ #
    # Assinatura                                                            #
    # ------------------------------------------------------------------ #

    def activate_subscription(
        self,
        user: User,
        asaas_customer_id: str,
        asaas_subscription_id: str,
        due_date: datetime,
    ) -> User:
        user.asaas_customer_id = asaas_customer_id
        user.asaas_subscription_id = asaas_subscription_id
        user.plano = PlanType.PRO
        user.subscription_status = SubscriptionStatus.ACTIVE
        user.subscription_due_date = due_date
        user.grace_period_end = None
        self.db.commit()
        self.db.refresh(user)
        return user

    def set_overdue(self, user: User, grace_period_end: datetime) -> User:
        """Marca assinatura como inadimplente e define fim do prazo de 30 dias."""
        user.subscription_status = SubscriptionStatus.OVERDUE
        user.grace_period_end = grace_period_end
        self.db.commit()
        self.db.refresh(user)
        return user

    def confirm_payment(self, user: User, due_date: datetime) -> User:
        """Pagamento confirmado — restabelece o plano PRO ativo."""
        user.plano = PlanType.PRO
        user.subscription_status = SubscriptionStatus.ACTIVE
        user.grace_period_end = None
        user.subscription_due_date = due_date
        self.db.commit()
        self.db.refresh(user)
        return user

    def downgrade_to_free(self, user: User) -> User:
        """Downgrade para plano gratuito após expirar o prazo de 30 dias."""
        user.plano = PlanType.FREE
        user.subscription_status = SubscriptionStatus.INACTIVE
        user.asaas_subscription_id = None
        user.subscription_due_date = None
        user.grace_period_end = None
        self.db.commit()
        self.db.refresh(user)
        return user

    def cancel_subscription(self, user: User) -> User:
        """Cancela a assinatura e volta ao plano gratuito."""
        user.plano = PlanType.FREE
        user.subscription_status = SubscriptionStatus.INACTIVE
        user.asaas_subscription_id = None
        user.subscription_due_date = None
        user.grace_period_end = None
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_expired_grace_period_users(self) -> List[User]:
        """Retorna usuários cujo prazo de 30 dias já expirou e ainda são PRO."""
        now = datetime.utcnow()
        return (
            self.db.query(User)
            .filter(
                User.subscription_status == SubscriptionStatus.OVERDUE,
                User.grace_period_end <= now,
            )
            .all()
        )

    def get_by_asaas_subscription_id(self, subscription_id: str) -> Optional[User]:
        return (
            self.db.query(User)
            .filter(User.asaas_subscription_id == subscription_id)
            .first()
        )