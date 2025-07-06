import os
from openai import OpenAI
from app.models.state import State
from typing import Optional

SUPPORTED_MODELS = {
    "gpt-4-turbo": "gpt-4-0125-preview",
    "gpt-4": "gpt-4",
    "gpt-3.5-turbo": "gpt-3.5-turbo-0125"
}

def openai_advanced_node(state: State, **params) -> State:
    try:
        # Initialize client with timeout
        client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY") or state["api_keys"].get("openai"),
            timeout=30.0
        )
        
        # Prepare messages
        messages = []
        if params.get("system_message"):
            messages.append({"role": "system", "content": params["system_message"]})
        if params.get("context"):
            messages.append({"role": "user", "content": f"Context: {params['context']}"})
        
        messages.append({
            "role": "user", 
            "content": params.get("user_prompt") or state.get("user_query", "")
        })

        # API call
        response = client.chat.completions.create(
            model=SUPPORTED_MODELS.get(params.get("model", "gpt-4-turbo"), "gpt-4-turbo"),
            messages=messages,
            temperature=min(max(0, params.get("temperature", 0.7)), 2),
            max_tokens=params.get("max_tokens"),
            response_format={"type": "json_object"} if params.get("json_mode") else None
        )
        
        state["current_output"] = response.choices[0].message.content
        return state
        
    except Exception as e:
        state["error"] = f"OpenAI Error: {str(e)}"
        raise