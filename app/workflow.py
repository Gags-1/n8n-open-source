from langgraph.graph import StateGraph, START, END
from app.models.state import State
from app.core.node_registry import node_registry
from typing import Dict, Any

def run_workflow(node_ids: list[str], user_query: str, api_keys: Dict[str, Any]):
    # Validate nodes
    for nid in node_ids:
        if nid not in node_registry:
            raise ValueError(f"Invalid node ID: {nid}")

    # Build graph
    graph_builder = StateGraph(State)
    for nid in node_ids:
        graph_builder.add_node(nid, node_registry[nid])
    
    # Connect nodes
    graph_builder.add_edge(START, node_ids[0])
    for i in range(len(node_ids)-1):
        graph_builder.add_edge(node_ids[i], node_ids[i+1])
    graph_builder.add_edge(node_ids[-1], END)

    # Initialize state
    _state: State = {
        "user_query": user_query,
        "current_output": None,
        "api_keys": api_keys,  # Pass all API keys directly
        "llm_config": {
            "temperature": 0.7,
            "max_tokens": 1024
        }
    }

    # Execute workflow
    graph = graph_builder.compile()
    result = graph.invoke(_state)
    return result