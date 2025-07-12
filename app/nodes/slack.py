
from slack_sdk import WebClient
from app.models.state import State

def slack_node(state: State, **params) -> State:
    client = WebClient(token=state["api_keys"].get("slack"))
    response = client.chat_postMessage(
        channel=params["channel"],
        text=params.get("message") or state["current_output"]
    )
    return state