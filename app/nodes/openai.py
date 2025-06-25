from openai import OpenAI
from app.models.state import State

def openai_node(state: State) -> State:
    client = OpenAI(api_key=state["openai_api_key"])
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": state["user_query"]}]
    )
    state["current_output"] = response.choices[0].message.content
    return state