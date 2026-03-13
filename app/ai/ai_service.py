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

_SYSTEM_MESSAGE_PRO_OVERRIDE = (
    "Você é um Staff Engineer com 15 anos de experiência em sistemas de alta escala em produção. "
    "Independente do nível declarado, entregue o planejamento mais completo e detalhado possível. "
    "Aplique as convenções, padrões e opiniões técnicas reconhecidas pela comunidade "
    "de cada linguagem e framework informado pelo usuário. "
    "Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON."
)

# Peso de complexidade por nível — controla ritmo e buffer do cronograma
_COMPLEXIDADE = {
    "básico":        {"buffer_pct": 0.30, "tarefas_por_slot": 2},
    "intermediário": {"buffer_pct": 0.20, "tarefas_por_slot": 3},
    "avançado":      {"buffer_pct": 0.15, "tarefas_por_slot": 5},
}


# ──────────────────────────────────────────────
# Utilitários de data (sem dependências externas)
# ──────────────────────────────────────────────

def _parse_prazo(prazo_str: str) -> date:
    """Interpreta o prazo em vários formatos comuns."""
    from datetime import datetime
    formatos = ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y"]
    for fmt in formatos:
        try:
            return datetime.strptime(prazo_str.strip(), fmt).date()
        except ValueError:
            continue
    return date.today() + timedelta(days=30)


def _fmt(d: date) -> str:
    return d.strftime("%d/%m/%Y")


def _dias_uteis(inicio: date, fim: date) -> List[date]:
    """Lista de dias úteis (seg–sex) entre inicio e fim, inclusive."""
    dias, current = [], inicio
    while current <= fim:
        if current.weekday() < 5:
            dias.append(current)
        current += timedelta(days=1)
    return dias


def _semanas_uteis(inicio: date, fim: date) -> List[Tuple[date, date]]:
    """Lista de (segunda, sexta) de cada semana entre inicio e fim."""
    semanas = []
    current = inicio - timedelta(days=inicio.weekday())
    while current <= fim:
        seg = max(current, inicio)
        sex = min(current + timedelta(days=4), fim)
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
        # Calcula o calendário real ANTES de montar o prompt
        inicio = date.today()
        fim = _parse_prazo(prazo)
        if fim <= inicio:
            fim = inicio + timedelta(days=7)

        if tipo_cronograma == "diario":
            calendario = _build_calendario_diario(inicio, fim, nivel)
        else:
            calendario = _build_calendario_semanal(inicio, fim, nivel)

        prompt = self._build_prompt(
            nome, descricao, nivel, tecnologias,
            tipo_cronograma, is_pro, calendario,
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
                json={"model": self.model, "prompt": prompt, "stream": False,
                      "temperature": 0.3, "format": "json"},
                timeout=120,
            )
            response.raise_for_status()
            plan_data = json.loads(response.json().get("response", ""))
            self._validate_plan_structure(plan_data)
            return plan_data
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                                detail=f"Ollama service unavailable: {str(e)}")
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Invalid JSON response from Ollama: {str(e)}")

    # ──────────────────────────────────────────────
    # Prompt builder
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
Retorne APENAS JSON válido. Nenhum texto fora do JSON.

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
    "diretorios": [
      {{
        "caminho": "string — caminho relativo (ex: src/modules/auth)",
        "descricao": "string — responsabilidade deste diretório",
        "arquivos_principais": ["string — arquivo e sua responsabilidade"]
      }}
    ]
  }},
  "checklist_tecnico": {{
    "itens": [
      {{
        "categoria": "string — ex: Segurança, Performance, Testes, Deploy",
        "tarefas": [
          {{
            "titulo": "string",
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
        "descricao": "string — o que será construído e por quê nesta ordem",
        "tarefas": ["string — tarefa técnica específica e acionável"],
        "duracao_estimada": "string — ex: 3 dias, 1 semana",
        "prioridade": "alta | média | baixa"
      }}
    ]
  }},
  {self._build_cronograma_schema(tipo_cronograma, calendario)}
}}

{self._get_quantidade_minima(nivel, is_pro)}"""

    # ──────────────────────────────────────────────
    # Helpers de cronograma
    # ──────────────────────────────────────────────

    def _format_calendario_resumo(self, tipo_cronograma: str, calendario: dict) -> str:
        if tipo_cronograma == "diario":
            linhas = [
                f"Total de dias úteis: {calendario['total_dias_uteis']}",
                f"Dias produtivos: {calendario['dias_produtivos']} | "
                f"Dias de buffer: {calendario['dias_buffer']}",
                f"Capacidade sugerida: até {calendario['tarefas_sugeridas_por_dia']} tarefas/dia",
                "",
            ]
            for d in calendario["dias"]:
                marcador = "📌" if d["tipo"] == "buffer/revisão" else "🔨"
                linhas.append(f"  {marcador} Dia {d['numero']:>2} | {d['data']} | {d['tipo']}")
        else:
            linhas = [
                f"Total de semanas: {calendario['total_semanas']}",
                f"Semanas produtivas: {calendario['semanas_produtivas']} | "
                f"Semanas de buffer: {calendario['semanas_buffer']}",
                "",
            ]
            for s in calendario["semanas"]:
                marcador = "📌" if s["tipo"] == "buffer/validação" else "🔨"
                linhas.append(f"  {marcador} Semana {s['numero']:>2} | {s['periodo']} | {s['tipo']}")
        return "\n".join(linhas)

    def _build_cronograma_instrucao(
        self, tipo_cronograma: str, calendario: dict, nivel: str
    ) -> str:
        cfg = _COMPLEXIDADE.get(nivel.lower(), _COMPLEXIDADE["intermediário"])

        if tipo_cronograma == "diario":
            return (
                f"Distribua as tarefas nos {calendario['dias_produtivos']} dias de DESENVOLVIMENTO listados acima. "
                f"Máximo de {cfg['tarefas_por_slot']} tarefas por dia. "
                "Use obrigatoriamente as datas reais do campo 'data' (DD/MM/YYYY) — nunca 'Dia 1' genérico. "
                f"Os {calendario['dias_buffer']} dias de BUFFER são para testes, correções e deploy — "
                "liste apenas tarefas de validação e refinamento nesses dias. "
                "ORDEM DE PRIORIDADE no cronograma:\n"
                "  1. Épicos de prioridade ALTA → primeiros 40% dos dias produtivos\n"
                "  2. Épicos de prioridade MÉDIA → próximos 40% dos dias produtivos\n"
                "  3. Épicos de prioridade BAIXA → últimos 20% dos dias produtivos\n"
                "  4. Dias de buffer → testes, ajustes, documentação e deploy"
            )
        else:
            return (
                f"Distribua as entregas nas {calendario['semanas_produtivas']} semanas de DESENVOLVIMENTO listadas acima. "
                "Use obrigatoriamente o campo 'periodo' (DD/MM/YYYY a DD/MM/YYYY) de cada semana — "
                "nunca 'Semana 1' sem data. "
                f"As {calendario['semanas_buffer']} semana(s) de BUFFER são para validação, "
                "regressão e deploy em produção. "
                "ORDEM DE PRIORIDADE no cronograma:\n"
                "  1. Épicos de prioridade ALTA → primeiros 50% das semanas produtivas\n"
                "  2. Épicos de prioridade MÉDIA → próximas 30% das semanas produtivas\n"
                "  3. Épicos de prioridade BAIXA → últimas 20% das semanas produtivas\n"
                "  4. Semanas de buffer → QA, documentação, deploy e ajustes finais"
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
        "objetivos": ["string — objetivo concreto e mensurável do dia"],
        "tarefas": ["string — tarefa técnica específica e acionável"],
        "epicos_relacionados": ["string — título do épico trabalhado neste dia"]
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
        "objetivos": ["string — objetivo concreto e verificável da semana"],
        "entregas": ["string — entrega verificável ao final da semana"],
        "epicos_relacionados": ["string — título do épico trabalhado nesta semana"]
      }}
    ]
  }}'''

    # ──────────────────────────────────────────────
    # Instruções de nível
    # ──────────────────────────────────────────────

    def _build_nivel_instrucoes(self, nivel: str, is_pro: bool) -> str:
        instrucoes = {
            "básico": """
Complexidade BÁSICA — diretrizes:
- Backlog: mínimo 3 épicos com linguagem simples. Critérios de aceite validáveis manualmente.
- Estrutura: convenção oficial da tecnologia informada. 1 frase por pasta explicando sua função.
- Checklist: Git, README, variáveis de ambiente, validação básica, tratamento de erros simples.
- Sequência: fases progressivas do mais simples ao mais complexo. Máximo 2 tarefas por slot.
- Prioridade: features visíveis primeiro (feedback rápido para o desenvolvedor iniciante).
""",
            "intermediário": """
Complexidade INTERMEDIÁRIA — diretrizes:
- Backlog: mínimo 4 épicos. Stories com critérios técnicos mensuráveis e testáveis.
- Estrutura: separação de responsabilidades por feature ou camada. Inclua testes e docs.
- Checklist: autenticação, autorização, validação, testes unitários/integração, logging,
  tratamento de erros estruturado, ambientes (dev/staging/prod), deploy.
- Sequência: setup → core features → integrações → testes → deploy.
- Cronograma: buffer de 20%. Alta prioridade nos primeiros 60% do prazo.
""",
            "avançado": """
Complexidade AVANÇADA — diretrizes:
- Backlog: mínimo 5 épicos com granularidade profissional. Critérios rigorosos incluindo
  performance, casos de borda, comportamento em falhas e requisitos de segurança.
- Estrutura: arquitetura adequada (Clean Architecture, DDD, Feature-based).
  Convenções do ecossistema:
  · NestJS → modules/controllers/services/guards/pipes
  · Django → apps com models/views/serializers/permissions/signals
  · React → features/components/hooks/stores/utils
  · FastAPI → routers/services/repositories/schemas/models
  Inclua CI/CD, IaC, automação, testes em múltiplas camadas, documentação técnica.
- Checklist obrigatório:
  · Segurança: OWASP Top 10, autenticação, autorização granular, rate limiting, CORS, CSP
  · Performance: caching, query optimization, lazy loading, CDN, profiling
  · Observabilidade: logs estruturados, métricas, tracing, alertas
  · Testes: cobertura mínima definida, contrato, carga, regressão
  · Deploy: CI/CD pipeline, rollback, health checks, zero-downtime
  · Qualidade: linting, type safety, code review checklist
- Sequência: foundation → domain model → API → business logic → integrações →
  observability → security hardening → performance tuning → QA → produção.
- Cronograma: buffer de 15%. Alta prioridade nos primeiros 50%. Segurança e observabilidade
  obrigatoriamente antes do deploy em produção.
""",
        }

        base = instrucoes.get(nivel.lower(), instrucoes["intermediário"])

        if is_pro and nivel.lower() != "avançado":
            base += (
                "\n[PLANO PRO] Eleve ao padrão avançado: inclua CI/CD, observabilidade básica, "
                "testes mais abrangentes e considerações de segurança aprofundadas."
            )

        return base.strip()

    def _get_quantidade_minima(self, nivel: str, is_pro: bool) -> str:
        minimos = {
            "básico":        "OBRIGATÓRIO: mínimo 3 épicos, 2 stories por épico, 3 fases de desenvolvimento.",
            "intermediário": "OBRIGATÓRIO: mínimo 4 épicos, 3 stories por épico, 4 fases de desenvolvimento.",
            "avançado":      "OBRIGATÓRIO: mínimo 5 épicos, 4 stories por épico, 5+ fases, checklist com mínimo 5 categorias.",
        }
        base = minimos.get(nivel.lower(), minimos["intermediário"])
        if is_pro:
            base += " Maximize o detalhamento em TODAS as seções (plano PRO)."
        base += (
            "\nIMPORTANTE: o cronograma deve cobrir TODOS os slots do calendário fornecido acima, "
            "usando as datas reais (DD/MM/YYYY). Não omita nenhum dia/semana listado. "
            "Cada slot deve ter pelo menos 1 tarefa ou entrega associada ao backlog."
        )
        return base

    # ──────────────────────────────────────────────
    # Validação
    # ──────────────────────────────────────────────

    def _validate_plan_structure(self, plan_data: Dict[str, Any]) -> None:
        required_keys = [
            "backlog", "estrutura_pastas", "checklist_tecnico",
            "sequencia_desenvolvimento", "cronograma_sugerido",
        ]
        for key in required_keys:
            if key not in plan_data:
                raise ValueError(f"Missing required key in AI response: {key}")
        for key in required_keys:
            if not isinstance(plan_data[key], dict):
                raise ValueError(f"Invalid structure for key: {key}")