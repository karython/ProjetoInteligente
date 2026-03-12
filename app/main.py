# /app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.routes import auth, projects, ai, subscriptions

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS: allow_credentials cannot be used with wildcard origin
# Use explicit origins for the production domain
ALLOWED_ORIGINS = [
    "https://planejador-inteligente.karythongomes.com.br",
    "http://localhost:5173",  # para desenvolvimento local
    "http://localhost:3000",  # se usar outra porta local
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    try:
        from alembic.config import Config
        from alembic import command
        import os
        # alembic.ini is at the project root (one level above app/)
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alembic_ini = os.path.join(project_root, 'alembic.ini')
        alembic_cfg = Config(alembic_ini)
        alembic_cfg.set_main_option('script_location', os.path.join(project_root, 'alembic'))
        command.upgrade(alembic_cfg, 'head')
        print("Migrations applied successfully.")
    except Exception as e:
        print(f"Migration error (falling back to create_all): {e}")
        Base.metadata.create_all(bind=engine)


app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(subscriptions.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}