from openai import OpenAI
from app.models.state import State
from typing import Optional, Dict, Literal
import os

# Supported models with updated naming
SUPPORTED_MODELS = {
    "gpt-4-turbo": "gpt-4-turbo-preview",
    "gpt-4": "gpt-4",
    "gpt-3.5-turbo": "gpt-3.5-turbo",
    # Removed gpt-4.1-mini as it's not a real OpenAI model
}

def openai_advanced_node(
    state: State,
    user_prompt: Optional[str] = None,
    context: Optional[str] = None,
    system_message: Optional[str] = "You are a helpful AI assistant.",
    model: str = "gpt-4-turbo",
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
    json_mode: bool = False,
    stream: bool = False
) -> State:
    """
    Robust OpenAI node with error handling and version compatibility
    """
    # Get API key - prefer environment variables for security
    api_key = state["api_keys"].get("openai") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OpenAI API key missing")
    
    # Validate model selection
    if model not in SUPPORTED_MODELS:
        raise ValueError(f"Unsupported model. Choose from: {', '.join(SUPPORTED_MODELS.keys())}")
    
    # Initialize client with minimal configuration
    client = OpenAI(
        api_key=api_key,
        # Removed proxies parameter that was causing issues
    )

    # Prepare messages with context handling
    messages = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    if context:
        messages.append({"role": "assistant", "content": f"Context: {context}"})
    
    final_prompt = user_prompt or state.get("user_query", "")
    if not final_prompt:
        raise ValueError("No prompt provided")
    messages.append({"role": "user", "content": final_prompt})

    # API call with enhanced error handling
    try:
        response = client.chat.completions.create(
            model=SUPPORTED_MODELS[model],
            messages=messages,
            temperature=max(0, min(2, temperature)),  # Clamped to 0-2 range
            max_tokens=max_tokens,
            response_format={"type": "json_object"} if json_mode else None,
            stream=stream
        )
        
        # Handle both streaming and regular responses
        if stream:
            full_response = "".join(
                chunk.choices[0].delta.content 
                for chunk in response 
                if chunk.choices[0].delta.content
            )
        else:
            full_response = response.choices[0].message.content
        
        # Update state
        state["current_output"] = full_response
        state["llm_metadata"] = {
            "model": model,
            "tokens_used": getattr(response.usage, "total_tokens", 0),
            "temperature": temperature,
            "system_message": system_message
        }
        
    except Exception as e:
        state["error"] = {
            "message": str(e),
            "type": type(e).__name__,
            "model": model
        }
        raise
    
    return state