import requests
from app.models.state import State

def webhook_node(state: State) -> State:
    webhook_url = state["api_keys"].get("webhook_url")
    
    if not webhook_url:
        raise ValueError("Webhook URL not provided in api_keys")
    
    payload = {
        "output": state.get("current_output", ""),
        "metadata": {
            "workflow_id": state.get("workflow_id")
        }
    }
    
    try:
        response = requests.post(
            webhook_url,
            json=payload,
            timeout=10
        )
        response.raise_for_status()
        state["current_output"] = f"Webhook sent to {webhook_url}"
    except Exception as e:
        raise ValueError(f"Webhook failed: {str(e)}")
    
    return state