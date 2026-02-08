# README.md
# NOME_DO_SISTEMA - Backend

Backend completo de plataforma SaaS educacional para planejamento de projetos com IA.

## Tecnologias

- Python 3.12
- FastAPI
- SQLAlchemy 2.x
- PostgreSQL
- JWT Authentication
- LLaMA 3 8B Instruct (via Ollama)

## Estrutura do Projeto
```
/app
    /core
        config.py          # Configurações
        security.py        # JWT e hashing
        database.py        # Conexão DB
        deps.py            # Dependencies
    /models
        user.py            # Modelo User
        project.py         # Modelo Project
        project_plan.py    # Modelo ProjectPlan
    /schemas
        user.py            # Schemas Pydantic User
        project.py         # Schemas Pydantic Project
    /repositories
        user_repository.py
        project_repository.py
        project_plan_repository.py
    /services
        auth_service.py    # Lógica autenticação
        project_service.py # Lógica projetos
        plan_service.py    # Lógica planejamento
    /routes
        auth.py            # Rotas autenticação
        projects.py        # Rotas projetos
        ai.py              # Rotas IA
    /ai
        ai_service.py      # Integração Ollama
    main.py                # App principal
```

## Pré-requisitos

1. Python 3.12+
2. PostgreSQL
3. Ollama com LLaMA 3 8B Instruct

### Instalar Ollama e LLaMA 3
```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo LLaMA 3 8B Instruct
ollama pull llama3:8b-instruct

# Verificar
ollama list
```

## Instalação

### Opção 1: Docker (Recomendado)
```bash
docker-compose up -d
```

### Opção 2: Local
```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nome_do_sistema"
export SECRET_KEY="your-secret-key-min-32-chars"

# Executar
uvicorn app.main:app --reload
```

## Endpoints

### Autenticação

- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login

### Projetos

- `POST /api/v1/projects` - Criar projeto
- `GET /api/v1/projects` - Listar projetos
- `GET /api/v1/projects/{id}` - Obter projeto
- `DELETE /api/v1/projects/{id}` - Deletar projeto

### IA

- `POST /api/v1/projects/{id}/generate-plan` - Gerar planejamento

## Regras de Negócio

### Plano FREE
- Máximo 2 projetos ativos
- 1 geração de planejamento por projeto

### Plano PRO
- Projetos ilimitados
- Replanejamento ilimitado

## Documentação

Acesse `/docs` para Swagger UI ou `/redoc` para ReDoc.

## Licença

Proprietary