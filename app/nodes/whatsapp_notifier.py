from twilio.rest import Client
from app.models.state import State

def whatsapp_node(state: State, **params) -> State:
    client = Client(
        state["api_keys"]["twilio_sid"],
        state["api_keys"]["twilio_token"]
    )
    
    message = client.messages.create(
        body=str(state["current_output"]),
        from_=f"whatsapp:{params['from_number']}",
        to=f"whatsapp:{params['to_number']}"
    )
    
    state["whatsapp_status"] = message.status
    return state