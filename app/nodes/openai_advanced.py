from openai import OpenAI
from app.models.state import State
from typing import Optional, Literal

# Supported models with their corresponding API identifiers
SUPPORTED_MODELS = {
    "gpt-4-turbo": "gpt-4-turbo-preview",
    "gpt-4": "gpt-4",
    "gpt-3.5-turbo": "gpt-3.5-turbo",
    "gpt=4.1-mini" : "gpt=4.1-mini"
}

def openai_advanced_node(
    state: State,
    user_prompt: Optional[str] = None,
    context: Optional[str] = None,
    system_message: Optional[str] = "You are a helpful AI assistant.",
    model: str = "gpt-4-turbo",
    temperature: float = 0.7,
    max_tokens: int = 1024,
    json_mode: bool = False,
    stream: bool = False
) -> State:
  
    # Get API key
    api_key = state["api_keys"].get("openai") or state.get("openai_api_key")
    if not api_key:
        raise ValueError("OpenAI API key missing")
    
    # Validate model selection
    if model not in SUPPORTED_MODELS:
        raise ValueError(f"Unsupported model. Choose from: {', '.join(SUPPORTED_MODELS.keys())}")
    
    actual_model = SUPPORTED_MODELS[model]
    
    # Prepare messages
    messages = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    if context:
        messages.append({"role": "user", "content": f"Context: {context}"})
    
    # Use provided prompt or state's user_query
    final_prompt = user_prompt or state.get("user_query", "")
    if not final_prompt:
        raise ValueError("No prompt provided")
    messages.append({"role": "user", "content": final_prompt})
    
    # API call with error handling
    client = OpenAI(api_key=api_key)
    try:
        response = client.chat.completions.create(
            model=actual_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"} if json_mode else None,
            stream=stream
        )
        
        if stream:
            
            collected_chunks = []
            for chunk in response:
                if chunk.choices[0].delta.content:
                    collected_chunks.append(chunk.choices[0].delta.content)
            full_response = "".join(collected_chunks)
        else:
         
            full_response = response.choices[0].message.content
        
     
        state["current_output"] = full_response
        state["llm_metadata"] = {
            "model": model,
            "tokens_used": response.usage.total_tokens,
            "temperature": temperature,
            "system_message": system_message
        }
        
    except Exception as e:
        state["error"] = f"OpenAI API error: {str(e)}"
        raise
    
    return state