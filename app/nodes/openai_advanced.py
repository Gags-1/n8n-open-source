import os
from openai import OpenAI
from app.models.state import State
from typing import Optional

# Map user-friendly model names to OpenAI's API models
SUPPORTED_MODELS = {
    "gpt-4-turbo": "gpt-4-0125-preview",
    "gpt-4": "gpt-4",
    "gpt-3.5-turbo": "gpt-3.5-turbo-0125"
}

def openai_advanced_node(state: State, **params) -> State:
    try:
        # Initialize OpenAI client with only valid args
        client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY") or state["api_keys"].get("openai")
        )

        # Prepare the message sequence
        messages = []

        if system_msg := params.get("system_message"):
            messages.append({"role": "system", "content": system_msg})

        if context := params.get("context"):
            messages.append({"role": "user", "content": f"Context: {context}"})

        # Add main user prompt (fallback to user_query if none provided)
        messages.append({
            "role": "user",
            "content": params.get("user_prompt") or state.get("user_query", "")
        })

        # Call OpenAI chat completion
        response = client.chat.completions.create(
            model=SUPPORTED_MODELS.get(params.get("model", "gpt-4-turbo"), "gpt-4-turbo"),
            messages=messages,
            temperature=min(max(0, params.get("temperature", 0.7)), 2),
            max_tokens=params.get("max_tokens"),
            response_format={"type": "json_object"} if params.get("json_mode") else None,
            timeout=30.0  # safe to apply here
        )

        # Save output to state
        state["current_output"] = response.choices[0].message.content
        return state

    except Exception as e:
        state["error"] = f"OpenAI Error: {str(e)}"
        raise
