import google.generativeai as genai
from app.models.state import State
from typing import Optional, Dict, Literal
from importlib.metadata import version  # Modern alternative to pkg_resources

SUPPORTED_MODELS = {
    "gemini-1.5-flash": "gemini-1.5-flash",
    "gemini-1.5-pro": "gemini-1.5-pro",
    "gemini-1.0-pro": "gemini-1.0-pro"
}

def _supports_system_instruction() -> bool:
    """Check if SDK supports system_instruction parameter"""
    try:
        sdk_version = version('google-generativeai')
        return tuple(map(int, sdk_version.split('.'))) >= (0, 3, 0)
    except:
        return False

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
        final_prompt = f"Context: {context}\n\n{final_prompt}"

    generation_config = {
        "temperature": temperature,
        **({"max_output_tokens": max_output_tokens} if max_output_tokens else {})
    }

    if _supports_system_instruction() and system_instruction:
   
        model = genai.GenerativeModel(
            model_name=model,
            generation_config=generation_config,
            system_instruction=system_instruction,
            safety_settings=safety_settings
        )
        response = model.generate_content(final_prompt)
    else:

        if system_instruction:
            final_prompt = f"[System Instruction]\n{system_instruction}\n\n{final_prompt}"
        
        model = genai.GenerativeModel(
            model_name=model,
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        response = model.generate_content(final_prompt)

    # Store results
    state["current_output"] = response.text
    state["gemini_metadata"] = {
        "model": model,
        "prompt_feedback": getattr(response, 'prompt_feedback', None),
        "usage_metadata": getattr(response, 'usage_metadata', None),
        "implementation": "native" if _supports_system_instruction() else "legacy"
    }

    return state