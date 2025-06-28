import google.generativeai as genai  
from app.models.state import State  

def gemini_node(state: State) -> State:  
    genai.configure(api_key=state["api_keys"]["gemini"])  
    model = genai.GenerativeModel('gemini-2.5-flash')  
    
    response = model.generate_content(  
        state["user_query"],  
        generation_config={"temperature": 0.7}  
    )  
    
    state["current_output"] = response.text  
    return state  