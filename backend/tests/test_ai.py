# Teste manual no Python REPL

import os
from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "Você é um assistente útil. Responda em JSON."
        },
        {
            "role": "user",
            "content": "Crie um objeto JSON com 3 tarefas de um projeto web."
        }
    ],
    model="llama-3.1-70b-versatile",
    temperature=0.3,
    response_format={"type": "json_object"}
)

print(chat_completion.choices[0].message.content)