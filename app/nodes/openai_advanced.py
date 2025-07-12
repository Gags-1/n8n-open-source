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
        # Initialize client with API key
        client = OpenAI(
            api_key=state["api_keys"].get("openai") or params.get("api_key")
        )
        
        # Prepare messages
        messages = []
        
        # Add system message if provided
        if params.get("system_instruction"):
            messages.append({
                "role": "system",
                "content": params["system_instruction"]
            })
            
        # Add context if provided
        if params.get("context"):
            messages.append({
                "role": "assistant",
                "content": params["context"]
            })
            
        # Add user query
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
        
        # Update state with response
        state["current_output"] = response.choices[0].message.content
        return state
        
    except Exception as e:
        state["error"] = f"OpenAI Error: {str(e)}"
        raise