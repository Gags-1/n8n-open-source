from openai import OpenAI
from app.models.state import State

def openai_node(state: State) -> State:
   
    api_key = state["api_keys"].get("openai") or state.get("openai_api_key")
    
    if not api_key:
        raise ValueError("OpenAI API key missing")

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4.1-mini",   
        messages=[{"role": "user", "content": state["user_query"]}]
    )
    
    state["current_output"] = response.choices[0].message.content
    return state