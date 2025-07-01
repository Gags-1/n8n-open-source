from langgraph.graph import StateGraph
from app.models.state import State
from app.core.node_registry import node_registry
from typing import Dict, Any, Optional

def run_workflow(
    node_ids: list[str], 
    user_query: str, 
    api_keys: Dict[str, Any],
    node_params: Optional[Dict[str, Dict[str, Any]]] = None  
):
    # Validate nodes
    for nid in node_ids:
        if nid not in node_registry:
            raise ValueError(f"Invalid node ID: {nid}")

    # Build graph
    workflow = StateGraph(State)
    
    # Add nodes
    for nid in node_ids:
        node_func = lambda state, nid=nid: node_registry[nid](
            state, 
            **(node_params.get(nid, {}) if node_params else {}
        ))
        workflow.add_node(nid, node_func)
    
    # Set entry point
    workflow.set_entry_point(node_ids[0])
    
    # Create linear workflow
    for i in range(len(node_ids)-1):
        workflow.add_edge(node_ids[i], node_ids[i+1])
    
    # Set finish point
    workflow.set_finish_point(node_ids[-1])
    
    # Initialize state
    _state: State = {
        "user_query": user_query,
        "current_output": None,
        "api_keys": api_keys,
        "node_params": node_params or {}
    }

    # Compile and execute
    app = workflow.compile()
    return app.invoke(_state)