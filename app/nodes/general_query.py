from openai import OpenAI
from dotenv import load_dotenv
from app.models.state import State

load_dotenv()
client = OpenAI()

def general_query(state: State) -> State:
    query = state["user_query"]
    SYSTEM_PROMPT = "You are a Helpful General Knowledge Assistant."

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": query}
        ]
    )

    state["llm_result"] = response.choices[0].message.content
    return state
