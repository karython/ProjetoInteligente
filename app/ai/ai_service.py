# /app/ai/ai_service.py
import json
import requests
from typing import Dict, Any
from fastapi import HTTPException, status
from groq import Groq
from app.core.config import settings


# ──────────────────────────────────────────────
# Personas por nível de dificuldade
# ──────────────────────────────────────────────

_SYSTEM_MESSAGES = {
    "básico": (
        "Você é um mentor de desenvolvimento de software especializado em guiar iniciantes. "
        "Seu objetivo é criar planejamentos claros, motivadores e didáticos, "
        "explicando o porquê de cada decisão de forma simples. "
        "Sugira boas práticas fundamentais sem jargões excessivos. "
        "Prefira caminhos convencionais e bem documentados. "
        "Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON."
    ),
    "intermediário": (
        "Você é um engenheiro de software sênior especializado em arquitetura de sistemas. "
        "Crie planejamentos detalhados aplicando padrões de design, boas práticas da indústria "
        "e convenções específicas das tecnologias informadas. "
        "Inclua separação de responsabilidades, testes e estratégias de deploy básicas. "
        "Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON."
    ),
    "avançado": (
        "Você é um Staff Engineer com 15 anos de experiência em sistemas de alta escala em produção. "
        "Domina arquitetura de software (DDD, Clean Architecture, CQRS, Event Sourcing), "
        "DevOps completo (CI/CD, IaC, observabilidade), segurança de aplicações, "
        "testes em múltiplas camadas (unit, integration, e2e, contract), "
        "otimização de performance e padrões específicos de cada framework. "
        "Gere planejamentos production-ready que um time profissional utilizaria em produção real. "
        "Aplique as convenções e opiniões técnicas aceitas pela comunidade de cada linguagem/framework informado. "
        "Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON."
    ),
}

# System message PRO sobrescreve o de nível quando o usuário tem plano PRO
_SYSTEM_MESSAGE_PRO_OVERRIDE = (
    "Você é um Staff Engineer com 15 anos de experiência em sistemas de alta escala em produção. "
    "Independente do nível declarado, entregue o planejamento mais completo e detalhado possível. "
    "Aplique as convenções, padrões e opiniões técnicas reconhecidas pela comunidade "
    "de cada linguagem e framework informado pelo usuário. "
    "Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON."
)


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
        prompt = self._build_prompt(nome, descricao, nivel, tecnologias, prazo, tipo_cronograma, is_pro)
        system_msg = self._build_system_message(nivel, is_pro)

        if self.provider == "GROQ":
            return self._generate_with_groq(prompt, system_msg)
        else:
            return self._generate_with_ollama(prompt)

    # ──────────────────────────────────────────────
    # System message
    # ──────────────────────────────────────────────

    def _build_system_message(self, nivel: str, is_pro: bool) -> str:
        if is_pro:
            return _SYSTEM_MESSAGE_PRO_OVERRIDE
        nivel_key = nivel.lower()
        return _SYSTEM_MESSAGES.get(nivel_key, _SYSTEM_MESSAGES["intermediário"])

    # ──────────────────────────────────────────────
    # Geração
    # ──────────────────────────────────────────────

    def _generate_with_groq(self, prompt: str, system_msg: str) -> Dict[str, Any]:
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt},
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=4000,
                response_format={"type": "json_object"},
            )
            generated_text = chat_completion.choices[0].message.content
            plan_data = json.loads(generated_text)
            self._validate_plan_structure(plan_data)
            return plan_data
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Groq API error: {str(e)}",
            )

    def _generate_with_ollama(self, prompt: str) -> Dict[str, Any]:
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "temperature": 0.3,
                    "format": "json",
                },
                timeout=120,
            )
            response.raise_for_status()
            result = response.json()
            generated_text = result.get("response", "")
            plan_data = json.loads(generated_text)
            self._validate_plan_structure(plan_data)
            return plan_data
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Ollama service unavailable: {str(e)}",
            )
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Invalid JSON response from Ollama: {str(e)}",
            )

    # ──────────────────────────────────────────────
    # Prompt builder
    # ──────────────────────────────────────────────

    def _build_prompt(
        self,
        nome: str,
        descricao: str,
        nivel: str,
        tecnologias: str,
        prazo: str,
        tipo_cronograma: str = "semanal",
        is_pro: bool = False,
    ) -> str:
        cronograma_instrucao, cronograma_schema = self._build_cronograma_block(tipo_cronograma)
        nivel_instrucoes = self._build_nivel_instrucoes(nivel, is_pro)

        return f"""Crie um planejamento completo e estruturado para o seguinte projeto:

━━━ CONTEXTO DO PROJETO ━━━
Nome: {nome}
Descrição: {descricao}
Nível de complexidade: {nivel}
Tecnologias e frameworks: {tecnologias}
Prazo final: {prazo}
Organização do cronograma: {tipo_cronograma.upper()}

━━━ INSTRUÇÕES DE NÍVEL ━━━
{nivel_instrucoes}

━━━ INSTRUÇÕES DO CRONOGRAMA ━━━
{cronograma_instrucao}

━━━ FORMATO DE SAÍDA ━━━
Retorne APENAS um JSON válido (sem markdown, sem texto fora do JSON) com esta estrutura exata:

{{
  "backlog": {{
    "epicos": [
      {{
        "titulo": "string — nome do épico",
        "descricao": "string — descrição técnica detalhada do épico",
        "prioridade": "alta | média | baixa",
        "user_stories": [
          {{
            "titulo": "string — título no formato 'Como X, quero Y para Z'",
            "descricao": "string — detalhamento técnico da story",
            "criterios_aceite": [
              "string — critério técnico mensurável e testável"
            ]
          }}
        ]
      }}
    ]
  }},
  "estrutura_pastas": {{
    "diretorios": [
      {{
        "caminho": "string — caminho relativo (ex: src/modules/auth)",
        "descricao": "string — responsabilidade deste diretório",
        "arquivos_principais": [
          "string — nome do arquivo e sua responsabilidade"
        ]
      }}
    ]
  }},
  "checklist_tecnico": {{
    "itens": [
      {{
        "categoria": "string — ex: Segurança, Performance, Testes, Deploy, Acessibilidade",
        "tarefas": [
          {{
            "titulo": "string — título da tarefa",
            "descricao": "string — como implementar e por que é importante",
            "prioridade": "alta | média | baixa"
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
        "descricao": "string — o que será construído nesta fase e por quê nesta ordem",
        "tarefas": [
          "string — tarefa técnica específica e acionável"
        ],
        "duracao_estimada": "string — ex: 3 dias, 1 semana"
      }}
    ]
  }},
  {cronograma_schema}
}}

Prazo total a cobrir: {prazo}. Cronograma no formato {tipo_cronograma}. {self._get_quantidade_minima(nivel, is_pro)}"""

    # ──────────────────────────────────────────────
    # Blocos auxiliares
    # ──────────────────────────────────────────────

    def _build_cronograma_block(self, tipo_cronograma: str):
        if tipo_cronograma == "diario":
            instrucao = (
                "Organize o cronograma POR DIA. Calcule os dias úteis disponíveis até o prazo. "
                "Cada dia deve ter objetivos claros e tarefas específicas e acionáveis. "
                "Distribua a carga de trabalho de forma realista — evite dias sobrecarregados."
            )
            schema = '''"cronograma_sugerido": {
    "tipo": "diario",
    "dias": [
      {
        "numero": 1,
        "data_referencia": "Dia 1",
        "objetivos": ["string — objetivo concreto do dia"],
        "tarefas": ["string — tarefa específica e acionável"]
      }
    ]
  }'''
        else:
            instrucao = (
                "Organize o cronograma POR SEMANA. Divida o prazo total em semanas produtivas. "
                "Cada semana deve ter objetivos claros e entregas verificáveis. "
                "Distribua a complexidade de forma progressiva — comece com fundação, "
                "avance para features e finalize com testes, refinamentos e deploy."
            )
            schema = '''"cronograma_sugerido": {
    "tipo": "semanal",
    "semanas": [
      {
        "numero": 1,
        "objetivos": ["string — objetivo concreto da semana"],
        "entregas": ["string — entrega verificável ao final da semana"]
      }
    ]
  }'''
        return instrucao, schema

    def _build_nivel_instrucoes(self, nivel: str, is_pro: bool) -> str:
        nivel_key = nivel.lower()

        instrucoes = {
            "básico": """
- Backlog: mínimo 3 épicos com linguagem simples e acessível.
  Cada story deve ter critérios de aceite que um iniciante consiga validar.
- Estrutura de pastas: use a estrutura convencional e recomendada pela documentação oficial
  das tecnologias informadas. Explique em 1 frase o que cada pasta faz.
- Checklist técnico: foque em boas práticas fundamentais — versionamento (Git), README,
  variáveis de ambiente, validação básica de inputs, tratamento de erros simples.
- Sequência de desenvolvimento: organize em fases didáticas e progressivas.
  Comece pelo mais simples (configuração, "hello world") e avance gradualmente.
- Cronograma: seja realista para um desenvolvedor iniciante. Adicione margem extra de tempo.
  Sugira recursos de aprendizado nas tarefas quando relevante.
""",
            "intermediário": """
- Backlog: mínimo 4 épicos bem definidos com user stories no formato adequado.
  Critérios de aceite devem ser técnicos, mensuráveis e testáveis.
- Estrutura de pastas: aplique separação de responsabilidades clara.
  Organize por feature ou por camada (conforme a convenção da tecnologia informada).
  Inclua pastas para testes, configuração e documentação.
- Checklist técnico: cubra autenticação e autorização, validação de dados,
  testes unitários e de integração básicos, logging, tratamento de erros estruturado,
  configuração de ambiente (dev/staging/prod) e estratégia de deploy.
- Sequência de desenvolvimento: estruture em fases lógicas —
  setup e infraestrutura → core features → integrações → testes → deploy.
- Cronograma: distribua considerando revisão de código, testes e correções de bugs.
""",
            "avançado": """
- Backlog: mínimo 5 épicos com granularidade profissional.
  User stories com critérios de aceite técnicos rigorosos incluindo:
  performance esperada, casos de borda, comportamento em falhas e requisitos de segurança.
- Estrutura de pastas: aplique a arquitetura mais adequada para as tecnologias informadas
  (Clean Architecture, Feature-based, Domain-driven, etc.).
  Inclua: configuração de CI/CD, infraestrutura como código (IaC), scripts de automação,
  estrutura de testes em múltiplas camadas (unit/integration/e2e), documentação técnica
  e convenções específicas do ecossistema (ex: para NestJS use modules/controllers/services/guards,
  para Django use apps com models/views/serializers/permissions, para React use
  features/components/hooks/stores, etc.).
- Checklist técnico: deve cobrir obrigatoriamente:
  Segurança (OWASP Top 10, autenticação, autorização granular, rate limiting, CORS, CSP),
  Performance (caching strategy, query optimization, lazy loading, CDN),
  Observabilidade (logs estruturados, métricas, tracing distribuído, alertas),
  Testes (cobertura mínima, testes de contrato, testes de carga),
  Deploy (pipeline CI/CD, rollback strategy, health checks, zero-downtime deployment),
  Qualidade de código (linting, formatação, type safety, code review checklist).
- Sequência de desenvolvimento: planeje como um time profissional trabalharia —
  foundation → domain model → API layer → business logic → integrations → 
  observability → security hardening → performance tuning → QA → production deploy.
- Cronograma: inclua sprints realistas com buffer para imprevistos (20% do tempo).
  Aponte dependências entre fases.
""",
        }

        base = instrucoes.get(nivel_key, instrucoes["intermediário"])

        if is_pro and nivel_key != "avançado":
            base += (
                "\n[PLANO PRO] Aplique adicionalmente padrões de nível avançado: "
                "inclua configuração de CI/CD, observabilidade básica, "
                "estratégia de testes mais abrangente e considerações de segurança aprofundadas."
            )

        return base.strip()

    def _get_quantidade_minima(self, nivel: str, is_pro: bool) -> str:
        nivel_key = nivel.lower()
        minimos = {
            "básico": "Gere pelo menos 3 épicos, 2 stories por épico e 3 fases de desenvolvimento.",
            "intermediário": "Gere pelo menos 4 épicos, 3 stories por épico e 4 fases de desenvolvimento.",
            "avançado": "Gere pelo menos 5 épicos, 4 stories por épico, 5+ fases de desenvolvimento e checklist técnico com no mínimo 5 categorias.",
        }
        base = minimos.get(nivel_key, minimos["intermediário"])
        if is_pro:
            base += " Como usuário PRO, maximize o detalhamento em todas as seções."
        return base

    # ──────────────────────────────────────────────
    # Validação
    # ──────────────────────────────────────────────

    def _validate_plan_structure(self, plan_data: Dict[str, Any]) -> None:
        required_keys = [
            "backlog",
            "estrutura_pastas",
            "checklist_tecnico",
            "sequencia_desenvolvimento",
            "cronograma_sugerido",
        ]
        for key in required_keys:
            if key not in plan_data:
                raise ValueError(f"Missing required key in AI response: {key}")

        if not isinstance(plan_data["backlog"], dict):
            raise ValueError("Invalid backlog structure")
        if not isinstance(plan_data["estrutura_pastas"], dict):
            raise ValueError("Invalid estrutura_pastas structure")
        if not isinstance(plan_data["checklist_tecnico"], dict):
            raise ValueError("Invalid checklist_tecnico structure")
        if not isinstance(plan_data["sequencia_desenvolvimento"], dict):
            raise ValueError("Invalid sequencia_desenvolvimento structure")
        if not isinstance(plan_data["cronograma_sugerido"], dict):
            raise ValueError("Invalid cronograma_sugerido structure")