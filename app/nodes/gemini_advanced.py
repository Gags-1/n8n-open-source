import google.generativeai as genai
from app.models.state import State
from typing import Optional, Dict, Literal

SUPPORTED_MODELS = {
    "gemini-1.5-flash": "gemini-1.5-flash",
    "gemini-1.5-pro": "gemini-1.5-pro",
    "gemini-2.5-flash": "gemini-2.5-flash",
    "gemini-2.5-pro": "gemini-2.5-pro"
}

def gemini_advanced_node(
    state: State,
    user_prompt: Optional[str] = None,
    context: Optional[str] = None,
    system_instruction: Optional[str] = None,
    model: str = "gemini-1.5-flash",
    temperature: float = 0.7,
    max_output_tokens: Optional[int] = None,
    safety_settings: Optional[Dict] = None
) -> State:
    # Get API key
    api_key = state["api_keys"].get("gemini")
    if not api_key:
        raise ValueError("Gemini API key missing")

    # Validate model
    if model not in SUPPORTED_MODELS:
        raise ValueError(f"Unsupported model. Choose from: {', '.join(SUPPORTED_MODELS.keys())}")

    # Configure client
    genai.configure(api_key=api_key)

    # Prepare input
    final_prompt = user_prompt or state.get("user_query", "")
    if context:
        final_prompt = f"Context: {context}\n\nQuestion: {final_prompt}"

    # Initialize model
    model_config = {
        "generation_config": {
            "temperature": temperature,
        }
    }
    
    if max_output_tokens:
        model_config["generation_config"]["max_output_tokens"] = max_output_tokens
    
    if system_instruction:
        model_config["system_instruction"] = system_instruction
    
    if safety_settings:
        model_config["safety_settings"] = safety_settings

    model = genai.GenerativeModel(model, **model_config)

    # Generate response
    try:
        response = model.generate_content(final_prompt)
        state["current_output"] = response.text
        state["gemini_metadata"] = {
            "model": model,
            "prompt_feedback": getattr(response, 'prompt_feedback', None),
            "usage_metadata": getattr(response, 'usage_metadata', None)
        }
    except Exception as e:
        state["error"] = f"Gemini API error: {str(e)}"
        raise

    return state