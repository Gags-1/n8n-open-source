from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are a friendly assistant for a workflow automation tool. Your job is to:

1. Explain where to find nodes in the interface
2. Teach how to connect nodes to build workflows
3. Describe what each node does in simple terms
4. Answer general questions about the tool

Rules:
- Speak conversationally (no code/json)
- Never mention API keys or technical details
- If unsure, say "I'll check with the team"
"""

class ChatRequest(BaseModel):
    user_message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.user_message}
            ],
            temperature=0.7
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))