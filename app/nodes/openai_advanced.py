import os
from openai import OpenAI
from app.models.state import State
from typing import Optional

# Supported OpenAI model mapping
SUPPORTED_MODELS = {
    "gpt-4-turbo": "gpt-4-0125-preview",
    "gpt-4": "gpt-4",
    "gpt-3.5-turbo": "gpt-3.5-turbo-0125"
}

def openai_advanced_node(state: State, **params) -> State:
    try:
        # Initialize OpenAI client
        client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY") or state["api_keys"].get("openai")
        )

        # Construct messages list
        messages = []

        # Optional system message
        if system_msg := params.get("system_message"):
            messages.append({"role": "system", "content": system_msg})

        # Optional context
        if context := params.get("context"):
            messages.append({"role": "user", "content": f"Context: {context}"})

        # Main user prompt
        user_prompt = params.get("user_prompt") or state.get("user_query", "")

        # Inject JSON hint if json_mode is set
        if params.get("json_mode"):
            user_prompt += "\nRespond only in JSON format."

        messages.append({"role": "user", "content": user_prompt})

        # Assemble request arguments
        completion_args = {
            "model": SUPPORTED_MODELS.get(params.get("model", "gpt-4-turbo"), "gpt-4-0125-preview"),
            "messages": messages,
            "temperature": min(max(0, params.get("temperature", 0.7)), 2),
            "max_tokens": params.get("max_tokens"),
            "timeout": 30.0
        }

        if params.get("json_mode"):
            completion_args["response_format"] = {"type": "json_object"}

        # Call OpenAI chat completion API
        response = client.chat.completions.create(**completion_args)

        # Store response
        state["current_output"] = response.choices[0].message.content
        return state

    except Exception as e:
        # Handle and record error
        state["error"] = f"OpenAI Error: {str(e)}"
        raise
