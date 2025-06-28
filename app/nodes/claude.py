import anthropic  
from app.models.state import State  

def claude_node(state: State) -> State:  
    client = anthropic.Client(api_key=state["api_keys"]["anthropic"])  
    
    response = client.messages.create(  
        model="claude-3-opus-20240229",  
        max_tokens=1024,  
        messages=[  
            {"role": "user", "content": state["user_query"]}  
        ]  
    )  
    
    state["current_output"] = response.content[0].text  
    return state  