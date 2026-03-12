# /app/ai/ai_service.py
import json
import requests
from typing import Dict, Any
from fastapi import HTTPException, status
from groq import Groq
from app.core.config import settings


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
        is_pro: bool = False
    ) -> Dict[str, Any]:
        prompt = self._build_prompt(nome, descricao, nivel, tecnologias, prazo, tipo_cronograma, is_pro)
        
        if self.provider == "GROQ":
            return self._generate_with_groq(prompt, is_pro)
        else:
            return self._generate_with_ollama(prompt)
    
    def _generate_with_groq(self, prompt: str, is_pro: bool = False) -> Dict[str, Any]:
        """Gera planejamento usando API Groq"""
        system_msg = (
            "Você é um engenheiro fullstack sênior com 15 anos de experiência em projetos de produção de alta escala. "
            "Domina arquitetura de software, DevOps, CI/CD, testes automatizados, clean code e padrões de mercado. "
            "Gere planejamentos extremamente detalhados e prontos para produção profissional, "
            "incluindo estruturas de pastas completas, backlogs granulares com critérios de aceite técnicos e cronogramas realistas. "
            "Retorne APENAS JSON válido, sem markdown, sem explicações."
        ) if is_pro else (
            "Você é um arquiteto de software especializado em planejamento de projetos. "
            "Retorne APENAS JSON válido, sem markdown, sem explicações."
        )
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_msg
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=4000,
                response_format={"type": "json_object"}
            )
            
            generated_text = chat_completion.choices[0].message.content
            plan_data = json.loads(generated_text)
            
            self._validate_plan_structure(plan_data)
            
            return plan_data
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Groq API error: {str(e)}"
            )
    
    def _generate_with_ollama(self, prompt: str) -> Dict[str, Any]:
        """Gera planejamento usando Ollama local"""
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "temperature": 0.3,
                    "format": "json"
                },
                timeout=120
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
                detail=f"Ollama service unavailable: {str(e)}"
            )
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Invalid JSON response from Ollama: {str(e)}"
            )
    
    def _build_prompt(
        self,
        nome: str,
        descricao: str,
        nivel: str,
        tecnologias: str,
        prazo: str,
        tipo_cronograma: str = "semanal",
        is_pro: bool = False
    ) -> str:
        if tipo_cronograma == "diario":
            cronograma_instrucao = (
                "Organize o cronograma POR DIA, calculando os dias úteis disponíveis "
                "entre hoje e o prazo. Use a chave 'dias' (lista de objetos com 'numero', "
                "'data_referencia' (ex: 'Dia 1', 'Dia 2'...), 'objetivos' e 'tarefas')."
            )
            cronograma_schema = """\"cronograma_sugerido\": {{
    \"tipo\": \"diario\",
    \"dias\": [
      {{
        \"numero\": 1,
        \"data_referencia\": \"Dia 1\",
        \"objetivos\": [\"string\"],
        \"tarefas\": [\"string\"]
      }}
    ]
  }}"""
        else:
            cronograma_instrucao = (
                "Organize o cronograma POR SEMANA, dividindo o prazo total em semanas. "
                "Use a chave 'semanas' (lista de objetos com 'numero', 'objetivos' e 'entregas')."
            )
            cronograma_schema = """\"cronograma_sugerido\": {{
    \"tipo\": \"semanal\",
    \"semanas\": [
      {{
        \"numero\": 1,
        \"objetivos\": [\"string\"],
        \"entregas\": [\"string\"]
      }}
    ]
  }}"""

        nivel_instrucao = (
            "Gere um planejamento de nível PROFISSIONAL e PRODUCTION-READY: "
            "épicos bem segmentados (mínimo 5), user stories detalhadas com critérios de aceite técnicos, "
            "estrutura de pastas completa como um projeto real de produção (incluindo configs, CI/CD, testes, docs), "
            "checklist técnico exaustivo cobrindo segurança, performance, testes e deploy."
        ) if is_pro else "Gere um planejamento completo e profissional."

        return f"""Crie um planejamento completo e estruturado para o seguinte projeto:

Nome: {nome}
Descrição: {descricao}
Nível: {nivel}
Tecnologias: {tecnologias}
Prazo final: {prazo}
Organização do cronograma: {tipo_cronograma.upper()} — {cronograma_instrucao}
Instrução especial: {nivel_instrucao}

Retorne APENAS um JSON válido (sem markdown, sem explicações) com a seguinte estrutura:

{{
  "backlog": {{
    "epicos": [
      {{
        "titulo": "string",
        "descricao": "string",
        "prioridade": "string",
        "user_stories": [
          {{
            "titulo": "string",
            "descricao": "string",
            "criterios_aceite": ["string"]
          }}
        ]
      }}
    ]
  }},
  "estrutura_pastas": {{
    "diretorios": [
      {{
        "caminho": "string",
        "descricao": "string",
        "arquivos_principais": ["string"]
      }}
    ]
  }},
  "checklist_tecnico": {{
    "itens": [
      {{
        "categoria": "string",
        "tarefas": [
          {{
            "titulo": "string",
            "descricao": "string",
            "prioridade": "string"
          }}
        ]
      }}
    ]
  }},
  "sequencia_desenvolvimento": {{
    "fases": [
      {{
        "numero": 1,
        "nome": "string",
        "descricao": "string",
        "tarefas": ["string"],
        "duracao_estimada": "string"
      }}
    ]
  }},
  {cronograma_schema}
}}

Gere um planejamento detalhado e profissional. O cronograma deve cobrir do início até o prazo ({prazo}) respeitando a organização {tipo_cronograma}."""
    
    def _validate_plan_structure(self, plan_data: Dict[str, Any]) -> None:
        """Valida estrutura do JSON retornado"""
        required_keys = [
            "backlog",
            "estrutura_pastas",
            "checklist_tecnico",
            "sequencia_desenvolvimento",
            "cronograma_sugerido"
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