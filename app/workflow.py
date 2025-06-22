# app/workflow.py

from langgraph.graph import StateGraph, END, START
from langchain_core.runnables import RunnableLambda
from app.models.state import State
from app.nodes.coding_query import coding_query
from app.nodes.general_query import general_query

def run_workflow(node_id: str, user_query: str):
    # Convert functions into LangChain runnables
    coding_node = RunnableLambda(coding_query)
    general_node = RunnableLambda(general_query)

    # Build the graph
    graph_builder = StateGraph(State)

    # Add all nodes
    graph_builder.add_node("coding_query", coding_node)
    graph_builder.add_node("general_query", general_node)

    # Conditional logic for node execution
    if node_id == "coding":
        graph_builder.add_edge(START, "coding_query")
        graph_builder.add_edge("coding_query", END)
    elif node_id == "general":
        graph_builder.add_edge(START, "general_query")
        graph_builder.add_edge("general_query", END)
    else:
        raise ValueError("Invalid node_id. Use 'coding' or 'general'.")

    # Compile and invoke graph
    graph = graph_builder.compile()
    
    _state: State = {
        "user_query": user_query,
        "llm_result" : None,
    }

    result = graph.invoke(_state)
    return result
