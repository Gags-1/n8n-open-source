from langgraph.graph import StateGraph, START, END
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
    graph_builder = StateGraph(State)
    for nid in node_ids:
        # Pass node_params to each node if they exist
        node_func = lambda state, nid=nid: node_registry[nid](
            state, 
            **(node_params.get(nid, {}) if node_params else {}
        ))
        graph_builder.add_node(nid, node_func)
    
    graph_builder.add_edge(START, node_ids[0])
    for i in range(len(node_ids)-1):
        graph_builder.add_edge(node_ids[i], node_ids[i+1])
    graph_builder.add_edge(node_ids[-1], END)

    _state: State = {
        "user_query": user_query,
        "current_output": None,
        "api_keys": api_keys,
        "node_params": node_params or {}  
    }

    graph = graph_builder.compile()
    return graph.invoke(_state)