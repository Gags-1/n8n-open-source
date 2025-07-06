import os
import google.generativeai as genai
from app.models.state import State

SUPPORTED_MODELS = ["gemini-pro", "gemini-1.5-pro","gemini-2.0-flash","gemini-1.5-flash"]

def gemini_advanced_node(state: State, **params) -> State:
    try:
        # Configuration
        genai.configure(api_key=os.getenv("GEMINI_API_KEY") or state["api_keys"].get("gemini"))
        
        # Prepare prompt
        prompt_parts = []
        if params.get("system_instruction"):
            prompt_parts.append(f"System: {params['system_instruction']}")
        if params.get("context"):
            prompt_parts.append(f"Context: {params['context']}")
        
        prompt_parts.append(params.get("user_prompt") or state.get("user_query", ""))
        prompt = "\n\n".join(prompt_parts)

        # Model initialization
        model = genai.GenerativeModel(
            model_name=params.get("model", "gemini-pro"),
            generation_config={
                "temperature": params.get("temperature", 0.7),
                "max_output_tokens": params.get("max_output_tokens")
            }
        )
        
        response = model.generate_content(prompt)
        state["current_output"] = response.text
        return state
        
    except Exception as e:
        state["error"] = f"Gemini Error: {str(e)}"
        raise