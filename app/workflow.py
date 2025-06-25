from langgraph.graph import StateGraph, START, END
from app.models.state import State
from app.core.node_registry import node_registry

def run_workflow(node_ids: list[str], user_query: str, api_keys: dict):
    # Validate nodes
    for nid in node_ids:
        if nid not in node_registry:
            raise ValueError(f"Invalid node ID: {nid}")
    
    # Build graph
    graph_builder = StateGraph(State)
    
    for nid in node_ids:
        graph_builder.add_node(nid, node_registry[nid])
    
    # Connect nodes in sequence
    graph_builder.add_edge(START, node_ids[0])
    for i in range(len(node_ids)-1):
        graph_builder.add_edge(node_ids[i], node_ids[i+1])
    graph_builder.add_edge(node_ids[-1], END)
    
    # Initialize state
    _state: State = {
        "user_query": user_query,
        "current_output": None,
        "openai_api_key": api_keys.get("openai") if "openai" in node_ids else None,
        "hashnode_token": api_keys.get("hashnode") if "hashnode" in node_ids else None,
        "hashnode_publication_id": api_keys.get("publication_id") if "hashnode" in node_ids else None,
        "email_config": api_keys.get("email_config") if "email" in node_ids else None,
    }
    
    # Execute workflow
    graph = graph_builder.compile()
    result = graph.invoke(_state)
    return result