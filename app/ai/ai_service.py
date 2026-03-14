# /app/ai/ai_service.py
import json
import math
import requests
from datetime import date, timedelta
from typing import Dict, Any, List, Tuple
from fastapi import HTTPException, status
from groq import Groq
from app.core.config import settings


# ──────────────────────────────────────────────
# Personas por nível
# ──────────────────────────────────────────────

_SYSTEM_MESSAGES = {
    "básico": (
        "Você é um mentor de desenvolvimento de software especializado em guiar iniciantes. "
        "Crie planejamentos claros, motivadores e didáticos, explicando o porquê de cada decisão. "
        "Sugira boas práticas fundamentais sem jargões excessivos. "
        "Prefira caminhos convencionais e bem documentados. "
        "Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON."
    ),
    "intermediário": (
        "Você é um engenheiro de software sênior especializado em arquitetura de sistemas. "
        "Crie planejamentos detalhados aplicando padrões de design, boas práticas da indústria "
        "e convenções específicas das tecnologias informadas. "
        "Inclua separação de responsabilidades, testes e estratégias de deploy. "
        "Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON."
    ),
    "avançado": (
        "Você é um Staff Engineer com 15 anos de experiência em sistemas de alta escala em produção. "
        "Domina DDD, Clean Architecture, CQRS, Event Sourcing, DevOps completo, CI/CD, IaC, "
        "observabilidade, segurança de aplicações e testes em múltiplas camadas. "
        "Gere planejamentos production-ready que um time profissional utilizaria em produção real. "
        "Aplique as convenções e boas práticas aceitas pela comunidade de cada linguagem/framework. "
        "Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON."
    ),
}

_SYSTEM_MESSAGE_PRO_OVERRIDE = (
    "Você é um Staff Engineer com 15 anos de experiência em sistemas de alta escala em produção. "
    "Independente do nível declarado, entregue o planejamento mais completo e detalhado possível. "
    "Aplique as convenções, padrões e boas práticas da comunidade de cada linguagem/framework. "
    "Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON."
)

_COMPLEXIDADE = {
    "básico":        {"buffer_pct": 0.30, "tarefas_por_slot": 2},
    "intermediário": {"buffer_pct": 0.20, "tarefas_por_slot": 3},
    "avançado":      {"buffer_pct": 0.15, "tarefas_por_slot": 5},
}


# ──────────────────────────────────────────────
# Utilitários de data
# ──────────────────────────────────────────────

def _parse_prazo(prazo_str: str) -> date:
    from datetime import datetime
    for fmt in ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y"]:
        try:
            return datetime.strptime(prazo_str.strip(), fmt).date()
        except ValueError:
            continue
    return date.today() + timedelta(days=30)


def _fmt(d: date) -> str:
    return d.strftime("%d/%m/%Y")


def _dias_uteis(inicio: date, fim: date) -> List[date]:
    dias, current = [], inicio
    while current <= fim:
        if current.weekday() < 5:
            dias.append(current)
        current += timedelta(days=1)
    return dias


def _semanas_uteis(inicio: date, fim: date) -> List[Tuple[date, date]]:
    semanas, current = [], inicio - timedelta(days=inicio.weekday())
    while current <= fim:
        seg, sex = max(current, inicio), min(current + timedelta(days=4), fim)
        if sex >= inicio:
            semanas.append((seg, sex))
        current += timedelta(weeks=1)
    return semanas


def _build_calendario_diario(inicio: date, fim: date, nivel: str) -> dict:
    cfg = _COMPLEXIDADE.get(nivel.lower(), _COMPLEXIDADE["intermediário"])
    dias_uteis = _dias_uteis(inicio, fim)
    dias_produtivos = math.ceil(len(dias_uteis) * (1 - cfg["buffer_pct"]))
    return {
        "data_inicio": _fmt(inicio),
        "data_entrega": _fmt(fim),
        "total_dias_uteis": len(dias_uteis),
        "dias_produtivos": dias_produtivos,
        "dias_buffer": len(dias_uteis) - dias_produtivos,
        "tarefas_sugeridas_por_dia": cfg["tarefas_por_slot"],
        "dias": [
            {
                "numero": i,
                "data": _fmt(d),
                "tipo": "buffer/revisão" if i > dias_produtivos else "desenvolvimento",
            }
            for i, d in enumerate(dias_uteis, start=1)
        ],
    }


def _build_calendario_semanal(inicio: date, fim: date, nivel: str) -> dict:
    cfg = _COMPLEXIDADE.get(nivel.lower(), _COMPLEXIDADE["intermediário"])
    semanas = _semanas_uteis(inicio, fim)
    semanas_produtivas = math.ceil(len(semanas) * (1 - cfg["buffer_pct"]))
    return {
        "data_inicio": _fmt(inicio),
        "data_entrega": _fmt(fim),
        "total_semanas": len(semanas),
        "semanas_produtivas": semanas_produtivas,
        "semanas_buffer": len(semanas) - semanas_produtivas,
        "semanas": [
            {
                "numero": i,
                "periodo": f"{_fmt(seg)} a {_fmt(sex)}",
                "tipo": "buffer/validação" if i > semanas_produtivas else "desenvolvimento",
            }
            for i, (seg, sex) in enumerate(semanas, start=1)
        ],
    }


# ──────────────────────────────────────────────
# Serviço principal
# ──────────────────────────────────────────────

class AIService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER
        if self.provider == "GROQ":
            if not settings.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY not configured")
            self.client = Groq(api_key=settings.GROQ_API_KEY)
            self.model = settings.GROQ_MODEL
        else:
            self.base_url = settings.OLLAMA_BASE_URL
            self.model = settings.OLLAMA_MODEL

    def generate_project_plan(
        self,
        nome: str,
        descricao: str,
        nivel: str,
        tecnologias: str,
        prazo: str,
        tipo_cronograma: str = "semanal",
        is_pro: bool = False,
    ) -> Dict[str, Any]:
        inicio = date.today()
        fim = _parse_prazo(prazo)
        if fim <= inicio:
            fim = inicio + timedelta(days=7)

        calendario = (
            _build_calendario_diario(inicio, fim, nivel)
            if tipo_cronograma == "diario"
            else _build_calendario_semanal(inicio, fim, nivel)
        )

        prompt = self._build_prompt(
            nome, descricao, nivel, tecnologias, tipo_cronograma, is_pro, calendario
        )
        system_msg = self._build_system_message(nivel, is_pro)

        if self.provider == "GROQ":
            return self._generate_with_groq(prompt, system_msg)
        return self._generate_with_ollama(prompt)

    # ──────────────────────────────────────────────
    # System message
    # ──────────────────────────────────────────────

    def _build_system_message(self, nivel: str, is_pro: bool) -> str:
        if is_pro:
            return _SYSTEM_MESSAGE_PRO_OVERRIDE
        return _SYSTEM_MESSAGES.get(nivel.lower(), _SYSTEM_MESSAGES["intermediário"])

    # ──────────────────────────────────────────────
    # Geração
    # ──────────────────────────────────────────────

    def _generate_with_groq(self, prompt: str, system_msg: str) -> Dict[str, Any]:
        try:
            resp = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt},
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=4000,
                response_format={"type": "json_object"},
            )
            plan_data = json.loads(resp.choices[0].message.content)
            self._validate_plan_structure(plan_data)
            return plan_data
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                detail=f"Groq API error: {str(e)}")

    def _generate_with_ollama(self, prompt: str) -> Dict[str, Any]:
        try:
            resp = requests.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt,
                      "stream": False, "temperature": 0.3, "format": "json"},
                timeout=120,
            )
            resp.raise_for_status()
            plan_data = json.loads(resp.json().get("response", ""))
            self._validate_plan_structure(plan_data)
            return plan_data
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                detail=f"Ollama unavailable: {str(e)}")
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Invalid JSON from Ollama: {str(e)}")

    # ──────────────────────────────────────────────
    # Prompt principal
    # ──────────────────────────────────────────────

    def _build_prompt(
        self,
        nome: str,
        descricao: str,
        nivel: str,
        tecnologias: str,
        tipo_cronograma: str,
        is_pro: bool,
        calendario: dict,
    ) -> str:
        return f"""Crie um planejamento completo e estruturado para o seguinte projeto:

━━━ CONTEXTO DO PROJETO ━━━
Nome: {nome}
Descrição: {descricao}
Nível de complexidade: {nivel}
Tecnologias e frameworks: {tecnologias}
Data de início: {calendario['data_inicio']}
Data de entrega: {calendario['data_entrega']}
Formato do cronograma: {tipo_cronograma.upper()}

━━━ CALENDÁRIO CALCULADO (USE ESTAS DATAS NO CRONOGRAMA) ━━━
{self._format_calendario_resumo(tipo_cronograma, calendario)}

━━━ INSTRUÇÕES DE NÍVEL E COMPLEXIDADE ━━━
{self._build_nivel_instrucoes(nivel, is_pro)}

━━━ INSTRUÇÕES DO CRONOGRAMA ━━━
{self._build_cronograma_instrucao(tipo_cronograma, calendario, nivel)}

━━━ FORMATO DE SAÍDA (JSON ESTRITO) ━━━
Retorne APENAS JSON válido, sem texto fora do JSON.

{{
  "backlog": {{
    "epicos": [
      {{
        "titulo": "string — nome do épico",
        "descricao": "string — descrição técnica detalhada",
        "prioridade": "alta | média | baixa",
        "user_stories": [
          {{
            "titulo": "string — 'Como X, quero Y para Z'",
            "descricao": "string — detalhamento técnico",
            "criterios_aceite": ["string — critério mensurável e testável"]
          }}
        ]
      }}
    ]
  }},

  "estrutura_pastas": {{
    "tree": "string — OBRIGATÓRIO: estrutura completa em formato de árvore de terminal usando os caracteres ├──, └──, │ e espaços. Exemplo:\\nraiz/\\n├── src/\\n│   ├── modules/\\n│   │   └── auth/\\n│   │       ├── auth.controller.ts\\n│   │       └── auth.service.ts\\n└── tests/\\n    └── auth.spec.ts",
    "descricao_geral": "string — arquitetura e padrão adotado (ex: Feature-based, Clean Architecture)",
    "diretorios": [
      {{
        "caminho": "string — caminho relativo (ex: src/modules/auth)",
        "descricao": "string — responsabilidade deste diretório",
        "arquivos_principais": ["string — arquivo: responsabilidade"]
      }}
    ]
  }},

  "checklist_tecnico": {{
    "itens": [
      {{
        "categoria": "string — nome da categoria",
        "tarefas": [
          {{
            "titulo": "string — título objetivo da tarefa",
            "descricao": "string — como implementar, ferramentas recomendadas e por que é importante",
            "prioridade": "alta | média | baixa",
            "ferramentas_sugeridas": ["string — biblioteca, ferramenta ou serviço recomendado"]
          }}
        ]
      }}
    ]
  }},

  "sequencia_desenvolvimento": {{
    "fases": [
      {{
        "numero": 1,
        "nome": "string — nome da fase",
        "descricao": "string — o que será construído, decisões técnicas e por quê nesta ordem",
        "tarefas": ["string — tarefa técnica específica, acionável e detalhada"],
        "criterios_conclusao": ["string — como saber que esta fase está concluída"],
        "dependencias": ["string — fase ou recurso necessário antes de iniciar"],
        "duracao_estimada": "string — ex: 3 dias úteis",
        "prioridade": "alta | média | baixa"
      }}
    ]
  }},

  {self._build_cronograma_schema(tipo_cronograma, calendario)}
}}

{self._get_quantidade_minima(nivel, is_pro)}"""

    # ──────────────────────────────────────────────
    # Calendário helpers
    # ──────────────────────────────────────────────

    def _format_calendario_resumo(self, tipo_cronograma: str, calendario: dict) -> str:
        if tipo_cronograma == "diario":
            linhas = [
                f"Total de dias úteis: {calendario['total_dias_uteis']}",
                f"Dias produtivos: {calendario['dias_produtivos']} | Dias de buffer: {calendario['dias_buffer']}",
                f"Capacidade: até {calendario['tarefas_sugeridas_por_dia']} tarefas/dia",
                "",
            ]
            for d in calendario["dias"]:
                marcador = "📌" if d["tipo"] == "buffer/revisão" else "🔨"
                linhas.append(f"  {marcador} Dia {d['numero']:>2} | {d['data']} | {d['tipo']}")
        else:
            linhas = [
                f"Total de semanas: {calendario['total_semanas']}",
                f"Semanas produtivas: {calendario['semanas_produtivas']} | Buffer: {calendario['semanas_buffer']}",
                "",
            ]
            for s in calendario["semanas"]:
                marcador = "📌" if s["tipo"] == "buffer/validação" else "🔨"
                linhas.append(f"  {marcador} Semana {s['numero']:>2} | {s['periodo']} | {s['tipo']}")
        return "\n".join(linhas)

    def _build_cronograma_instrucao(self, tipo_cronograma: str, calendario: dict, nivel: str) -> str:
        cfg = _COMPLEXIDADE.get(nivel.lower(), _COMPLEXIDADE["intermediário"])
        if tipo_cronograma == "diario":
            return (
                f"Distribua tarefas nos {calendario['dias_produtivos']} dias de DESENVOLVIMENTO acima. "
                f"Máximo {cfg['tarefas_por_slot']} tarefas por dia. "
                "Use obrigatoriamente as datas reais do campo 'data' (DD/MM/YYYY). "
                f"Os {calendario['dias_buffer']} dias de BUFFER são exclusivos para testes e deploy.\n"
                "PRIORIDADE: Alta → primeiros 40% | Média → 40% seguintes | Baixa → 20% finais | Buffer → QA e deploy."
            )
        else:
            return (
                f"Distribua entregas nas {calendario['semanas_produtivas']} semanas de DESENVOLVIMENTO acima. "
                "Use obrigatoriamente o campo 'periodo' (DD/MM/YYYY a DD/MM/YYYY). "
                f"As {calendario['semanas_buffer']} semana(s) de BUFFER são para QA e deploy.\n"
                "PRIORIDADE: Alta → primeiros 50% | Média → 30% seguintes | Baixa → 20% finais | Buffer → deploy."
            )

    def _build_cronograma_schema(self, tipo_cronograma: str, calendario: dict) -> str:
        if tipo_cronograma == "diario":
            ex = calendario["dias"][0]["data"] if calendario["dias"] else "13/03/2025"
            return f'''"cronograma_sugerido": {{
    "tipo": "diario",
    "data_inicio": "{calendario['data_inicio']}",
    "data_entrega": "{calendario['data_entrega']}",
    "total_dias_uteis": {calendario['total_dias_uteis']},
    "dias": [
      {{
        "numero": 1,
        "data": "{ex}",
        "tipo": "desenvolvimento | buffer/revisão",
        "prioridade_foco": "alta | média | baixa",
        "objetivos": ["string — objetivo mensurável do dia"],
        "tarefas": ["string — tarefa técnica específica e acionável"],
        "epicos_relacionados": ["string — título do épico trabalhado"]
      }}
    ]
  }}'''
        else:
            ex = calendario["semanas"][0]["periodo"] if calendario["semanas"] else "13/03/2025 a 17/03/2025"
            return f'''"cronograma_sugerido": {{
    "tipo": "semanal",
    "data_inicio": "{calendario['data_inicio']}",
    "data_entrega": "{calendario['data_entrega']}",
    "total_semanas": {calendario['total_semanas']},
    "semanas": [
      {{
        "numero": 1,
        "periodo": "{ex}",
        "tipo": "desenvolvimento | buffer/validação",
        "prioridade_foco": "alta | média | baixa",
        "objetivos": ["string — objetivo verificável da semana"],
        "entregas": ["string — entrega verificável ao final da semana"],
        "epicos_relacionados": ["string — título do épico trabalhado"]
      }}
    ]
  }}'''

    # ──────────────────────────────────────────────
    # Instruções de nível (checklist + sequência detalhados)
    # ──────────────────────────────────────────────

    def _build_nivel_instrucoes(self, nivel: str, is_pro: bool) -> str:
        instrucoes = {

            # ── BÁSICO ──────────────────────────────────────────────────────
            "básico": """
Complexidade BÁSICA — aplique as seguintes diretrizes:

BACKLOG: mínimo 3 épicos com linguagem simples. Critérios de aceite validáveis manualmente.

ESTRUTURA DE PASTAS:
- Use a estrutura convencional recomendada pela documentação oficial das tecnologias informadas.
- Gere o campo "tree" como uma árvore de terminal completa com ├──, └──, │.
- Inclua apenas as pastas e arquivos essenciais para um projeto básico funcionar.
- Explique em 1 frase curta a responsabilidade de cada diretório.

CHECKLIST TÉCNICO — gere no mínimo 4 categorias, cada uma com no mínimo 4 tarefas:
- Configuração inicial: setup do repositório Git, .gitignore, README.md com instruções de instalação
  e execução, variáveis de ambiente (.env e .env.example), estrutura básica de pastas.
- Qualidade de código: formatação consistente (ex: Prettier, Black), convenção de nomes
  (variáveis, funções, arquivos), comentários em trechos complexos, remoção de código morto.
- Validação e erros: validação dos inputs do usuário antes de processar, mensagens de erro
  claras e amigáveis ao usuário, tratamento de casos nulos/undefined, feedback visual de loading.
- Deploy básico: escolha de plataforma simples (Vercel, Railway, Render), configuração de
  variáveis de ambiente em produção, teste manual do fluxo completo antes de publicar,
  URL pública funcional e documentada no README.

SEQUÊNCIA DE DESENVOLVIMENTO — gere no mínimo 4 fases detalhadas:
- Fase 1 (Setup): configure o ambiente local, instale dependências, valide que o projeto roda.
  Inclua: inicializar repositório, criar estrutura de pastas, configurar linter/formatter.
- Fase 2 (Funcionalidades core): implemente as features de maior visibilidade primeiro
  para ter feedback rápido. Cada tarefa deve ser pequena e testável manualmente.
- Fase 3 (Ajustes e polish): corrija bugs encontrados nos testes manuais, melhore
  mensagens de erro, adicione validações que faltaram, revise o fluxo completo.
- Fase 4 (Deploy): configure a plataforma, faça o primeiro deploy, valide em produção,
  documente a URL e as instruções no README.
- Para cada fase inclua: critérios_conclusao (como saber que terminou) e dependencias.
""",

            # ── INTERMEDIÁRIO ────────────────────────────────────────────────
            "intermediário": """
Complexidade INTERMEDIÁRIA — aplique as seguintes diretrizes:

BACKLOG: mínimo 4 épicos. Stories com critérios de aceite técnicos, mensuráveis e testáveis.

ESTRUTURA DE PASTAS:
- Aplique separação de responsabilidades por feature ou por camada conforme a convenção
  da tecnologia informada. Inclua pastas para testes, configuração e documentação.
- Gere o campo "tree" como uma árvore de terminal completa com ├──, └──, │.
- A árvore deve refletir a arquitetura real: controllers, services, repositories, models,
  schemas, middlewares, tests — conforme aplicável ao stack informado.
- Inclua arquivos de configuração reais: .env.example, docker-compose.yml (se aplicável),
  configuração de linter, formatter e testes.

CHECKLIST TÉCNICO — gere no mínimo 6 categorias, cada uma com no mínimo 5 tarefas:
- Autenticação e autorização: JWT ou sessão com refresh token, hash de senhas (bcrypt/argon2),
  middleware de autenticação em rotas protegidas, controle de permissões por perfil de usuário,
  proteção contra força bruta (rate limiting no login), logout com invalidação de token.
- Validação de dados: schema validation na entrada (Zod, Joi, Pydantic, class-validator),
  sanitização de inputs para prevenir XSS e SQL Injection, validação de tipos e formatos
  (email, CPF, datas), retorno de erros de validação com campos específicos identificados.
- Testes: testes unitários para funções de negócio críticas, testes de integração para
  endpoints da API, cobertura mínima de 60% nas funções de domínio, mock de dependências
  externas (banco, APIs), script de execução de testes no CI.
- Tratamento de erros: handler global de erros com respostas padronizadas (código + mensagem),
  logging de erros com stack trace em ambiente de desenvolvimento, respostas de erro sem
  expor detalhes internos em produção, tratamento de timeout e falhas de rede.
- Configuração de ambientes: variáveis de ambiente separadas por ambiente (dev/staging/prod),
  docker-compose para desenvolvimento local, configuração de banco de dados por ambiente,
  scripts de seed e migration versionados.
- Deploy e CI/CD básico: pipeline com lint + test + build antes do deploy, deploy automático
  ao merge na branch principal, health check endpoint (/health), configuração de CORS correta,
  HTTPS obrigatório em produção, rollback manual documentado.

SEQUÊNCIA DE DESENVOLVIMENTO — gere no mínimo 6 fases detalhadas:
- Fase 1 (Foundation): configure repositório, CI básico, estrutura de pastas, Docker local,
  banco de dados e migrations iniciais. Critério: ambiente rodando com health check verde.
- Fase 2 (Autenticação): implemente registro, login, refresh token, middleware de auth.
  Critério: endpoints de auth testados com Postman/Insomnia, testes unitários passando.
- Fase 3 (Core features — alta prioridade): implemente os épicos de prioridade alta.
  Para cada feature: model → repository → service → controller → testes → validação.
- Fase 4 (Core features — média prioridade): implemente épicos de média prioridade seguindo
  o mesmo padrão. Inclua integração entre módulos e testes de integração.
- Fase 5 (Integrações externas): conecte APIs de terceiros, configure webhooks,
  adicione retry logic e circuit breaker para chamadas externas.
- Fase 6 (QA e deploy): execute suite completa de testes, corrija issues encontrados,
  configure pipeline de deploy, valide em staging, faça deploy em produção.
- Para cada fase inclua: criterios_conclusao detalhados e dependencias explícitas.
""",

            # ── AVANÇADO ─────────────────────────────────────────────────────
            "avançado": """
Complexidade AVANÇADA — aplique as seguintes diretrizes:

BACKLOG: mínimo 5 épicos com granularidade profissional. Critérios de aceite rigorosos:
performance esperada (ex: p95 < 200ms), casos de borda, comportamento em falhas e segurança.

ESTRUTURA DE PASTAS:
- Aplique a arquitetura mais adequada ao stack informado (Clean Architecture, DDD, Feature-based).
- Gere o campo "tree" como uma árvore de terminal COMPLETA e DETALHADA com ├──, └──, │.
- Aplique as convenções do ecossistema:
  · NestJS → src/modules/{feature}/{feature}.module.ts, .controller.ts, .service.ts,
    .repository.ts, .guard.ts, .pipe.ts, dto/, entities/, interfaces/
  · Django → {app}/models.py, views.py, serializers.py, permissions.py, signals.py,
    urls.py, admin.py, tests/, migrations/
  · React/Next.js → src/features/{feature}/components/, hooks/, stores/, api/, types/
    + shared/components/, shared/hooks/, shared/utils/, shared/types/
  · FastAPI → app/routers/, app/services/, app/repositories/, app/schemas/,
    app/models/, app/core/, app/middleware/, app/dependencies/
- Inclua obrigatoriamente: .github/workflows/ (CI/CD), infrastructure/ ou terraform/
  (IaC), docs/ (documentação técnica), scripts/ (automação), Makefile ou justfile.

CHECKLIST TÉCNICO — gere no mínimo 8 categorias, cada uma com no mínimo 6 tarefas:
- Segurança (OWASP Top 10): proteção contra SQL Injection e XSS com sanitização e ORM,
  CSRF token em operações de escrita, rate limiting por IP e por usuário (ex: 100 req/min),
  headers de segurança (HSTS, CSP, X-Frame-Options) via helmet ou equivalente,
  validação e sanitização rigorosa de todos os inputs, autenticação MFA para operações críticas,
  auditoria de dependências (npm audit, safety, snyk), secrets nunca no código (vault ou env).
- Autenticação e autorização avançada: JWT com rotação de refresh token e blacklist,
  RBAC ou ABAC com políticas granulares por recurso, OAuth2/OIDC para SSO,
  proteção contra força bruta com lockout progressivo, sessões com expiração e revogação,
  logs de auditoria de acesso com IP, user-agent e timestamp.
- Performance e escalabilidade: estratégia de caching multicamada (in-memory + Redis),
  query optimization com índices estratégicos e explain analyze, connection pooling configurado,
  paginação em todos os listagens (cursor ou offset com limite máximo),
  lazy loading e code splitting no frontend, CDN para assets estáticos,
  compressão gzip/brotli nas respostas da API.
- Observabilidade: logs estruturados em JSON com correlation ID por request,
  métricas de negócio e técnicas exportadas (Prometheus/Datadog/CloudWatch),
  tracing distribuído com OpenTelemetry, alertas configurados para p95 > SLA,
  dashboard de health (uptime, latência, taxa de erro), log rotation e retenção configurados.
- Testes em múltiplas camadas: testes unitários com cobertura mínima de 80% no domínio,
  testes de integração para todos os endpoints críticos, testes e2e para fluxos
  de negócio principais (Cypress, Playwright, pytest-e2e), testes de contrato (Pact),
  testes de carga com cenário de pico documentado (k6, Locust), mutation testing
  para validar qualidade dos testes, testes de segurança automatizados (OWASP ZAP).
- CI/CD e DevOps: pipeline com stages (lint → test → build → security scan → deploy),
  deploy com zero-downtime (blue-green ou rolling update), rollback automático em falha
  de health check, ambientes isolados (dev/staging/prod) com promoção controlada,
  IaC versionado (Terraform, Pulumi ou CDK), secrets management (Vault, AWS Secrets Manager),
  revisão obrigatória de PR antes de merge na main.
- Qualidade de código: linting estrito (ESLint + regras customizadas, Pylint/Ruff),
  type safety completo (TypeScript strict mode, Python type hints + mypy),
  formatação automática no pre-commit hook, code review checklist documentado,
  arquitetura decision records (ADRs) para decisões técnicas relevantes,
  documentação de API gerada automaticamente (OpenAPI/Swagger, AsyncAPI).
- Resiliência e confiabilidade: retry com exponential backoff para chamadas externas,
  circuit breaker para dependências críticas (Resilience4j, tenacity),
  graceful shutdown com drenagem de conexões, timeout configurado em todas as
  chamadas externas, dead letter queue para mensagens com falha, health checks
  detalhados por dependência (banco, cache, APIs externas).

SEQUÊNCIA DE DESENVOLVIMENTO — gere no mínimo 8 fases com critérios de conclusão rigorosos:
- Fase 1 (Foundation): repositório, pipeline CI básico (lint+test), estrutura de pastas
  conforme arquitetura escolhida, Docker compose completo (app+db+cache+queue),
  migrations com Alembic/Flyway/Prisma, seed de dados de desenvolvimento.
  Critério: CI verde, ambiente local rodando com todos os serviços healthy.
- Fase 2 (Domain model): entidades de domínio, value objects, agregados, repositórios
  abstratos, regras de negócio core sem dependências de infraestrutura.
  Critério: 100% de cobertura de testes no domínio.
- Fase 3 (Infraestrutura e autenticação): implementação dos repositórios concretos,
  autenticação completa (JWT + refresh + RBAC), middleware de auth, rate limiting.
  Critério: endpoints de auth testados, testes de integração passando.
- Fase 4 (Core features — alta prioridade): épicos de alta prioridade seguindo o fluxo:
  domínio → use case → controller → testes unitários + integração → documentação OpenAPI.
  Critério: todos os endpoints documentados, cobertura ≥ 80% no módulo.
- Fase 5 (Core features — média prioridade): épicos de média prioridade com o mesmo padrão.
  Inclua integração entre módulos e testes de integração cross-module.
- Fase 6 (Integrações e eventos): APIs externas com retry/circuit breaker, webhooks,
  filas de mensagens para operações assíncronas, dead letter queues configuradas.
  Critério: testes de contrato passando, falhas externas tratadas graciosamente.
- Fase 7 (Observabilidade e segurança): instrumentação completa (logs, métricas, tracing),
  headers de segurança, audit logs, scan de vulnerabilidades (Snyk/Trivy), pentest básico.
  Critério: dashboard de health operacional, zero alertas de segurança críticos.
- Fase 8 (Performance, QA e produção): testes de carga, otimização de queries lentas,
  configuração de caching, deploy em produção com zero-downtime, smoke tests pós-deploy,
  runbook documentado para incidentes comuns.
  Critério: p95 < SLA definido, taxa de erro < 0.1% em produção.
- Para cada fase inclua: criterios_conclusao mensuráveis e dependencias explícitas.
""",
        }

        base = instrucoes.get(nivel.lower(), instrucoes["intermediário"]).strip()

        if is_pro and nivel.lower() != "avançado":
            base += (
                "\n\n[PLANO PRO] Eleve ao padrão avançado: adicione categorias de observabilidade "
                "e segurança no checklist, inclua critérios_conclusao mensuráveis em cada fase "
                "e detalhe as tarefas da sequência com ferramentas específicas recomendadas."
            )

        return base

    def _get_quantidade_minima(self, nivel: str, is_pro: bool) -> str:
        minimos = {
            "básico": (
                "OBRIGATÓRIO: mínimo 3 épicos | 2 stories/épico | 4 fases | "
                "4 categorias no checklist com 4 tarefas cada."
            ),
            "intermediário": (
                "OBRIGATÓRIO: mínimo 4 épicos | 3 stories/épico | 6 fases | "
                "6 categorias no checklist com 5 tarefas cada."
            ),
            "avançado": (
                "OBRIGATÓRIO: mínimo 5 épicos | 4 stories/épico | 8 fases | "
                "8 categorias no checklist com 6 tarefas cada. "
                "Cada fase DEVE ter criterios_conclusao e dependencias preenchidos."
            ),
        }
        base = minimos.get(nivel.lower(), minimos["intermediário"])
        if is_pro:
            base += " Maximize o detalhamento em TODAS as seções (plano PRO)."
        base += (
            "\nIMPORTANTE: o campo 'tree' em estrutura_pastas deve ser uma string com a "
            "árvore de diretórios completa no formato de terminal (├──, └──, │). "
            "O cronograma deve cobrir TODOS os slots do calendário acima com datas reais (DD/MM/YYYY)."
        )
        return base

    # ──────────────────────────────────────────────
    # Validação
    # ──────────────────────────────────────────────

    def _validate_plan_structure(self, plan_data: Dict[str, Any]) -> None:
        required = [
            "backlog",
            "estrutura_pastas",
            "checklist_tecnico",
            "sequencia_desenvolvimento",
            "cronograma_sugerido",
        ]

        for key in required:
            if key not in plan_data:
                plan_data[key] = {}

        # garante que cronograma sempre exista
        if not isinstance(plan_data["cronograma_sugerido"], dict):
            plan_data["cronograma_sugerido"] = {}