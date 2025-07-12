# openai_advanced.py
from typing import Optional, Dict
from openai import OpenAI
from app.models.state import State

SUPPORTED_MODELS = [
    "gpt-4-turbo-preview",
    "gpt-4",
    "gpt-3.5-turbo",
    "gpt-4-32k",
    "gpt-4-vision-preview"
]

def openai_advanced_node(state: State, **params) -> State:
    try:
        # Safely initialize client without any unexpected kwargs
        client_params = {
            'api_key': state["api_keys"].get("openai") or params.get("api_key")
        }
        
        # Filter out None values to avoid passing empty params
        client_params = {k: v for k, v in client_params.items() if v is not None}
        
        client = OpenAI(**client_params)
        
        # Prepare messages
        messages = []
        
        if params.get("system_instruction"):
            messages.append({
                "role": "system",
                "content": params["system_instruction"]
            })
            
        if params.get("context"):
            messages.append({
                "role": "assistant",
                "content": params["context"]
            })
            
        messages.append({
            "role": "user",
            "content": params.get("user_prompt") or state.get("user_query", "")
        })
        
        # Create completion
        response = client.chat.completions.create(
            model=params.get("model", "gpt-3.5-turbo"),
            messages=messages,
            temperature=params.get("temperature", 0.7),
            max_tokens=params.get("max_tokens"),
            top_p=params.get("top_p", 1.0),
            frequency_penalty=params.get("frequency_penalty", 0),
            presence_penalty=params.get("presence_penalty", 0)
        )
        
        state["current_output"] = response.choices[0].message.content
        return state
        
    except Exception as e:
        state["error"] = f"OpenAI Error: {str(e)}"
        raise