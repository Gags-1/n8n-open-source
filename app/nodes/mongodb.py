from pymongo import MongoClient
from bson import json_util
from app.models.state import State

from typing import List

def mongodb_node(state: State) -> State:
    params = state.get("node_params", {}).get("mongodb", {})
    client = MongoClient(state["api_keys"]["mongodb_uri"])
    db = client.get_database()
    
    # Vector Search (requires pre-computed embeddings)
    if params.get("operation") == "vector_search":
        query_embedding = get_embedding(state["user_query"])  # Use OpenAI embeddings
        results = db[params["collection"]].aggregate([
            {
                "$vectorSearch": {
                    "queryVector": query_embedding,
                    "path": params["vector_field"],
                    "numCandidates": 100,
                    "limit": params.get("limit", 5),
                    "index": "vector_index"  # Pre-created Atlas index
                }
            }
        ])
        state["current_output"] = json_util.dumps(list(results))
    
    # Standard CRUD
    else:
        operation = getattr(db[params["collection"]], params["operation"])
        state["current_output"] = json_util.dumps(operation(params["query"]))
    
    return state

def get_embedding(text: str) -> List[float]:
    """Generate embeddings using OpenAI"""
    from openai import OpenAI
    client = OpenAI(api_key=State["api_keys"]["openai"])
    return client.embeddings.create(
        input=[text],
        model="text-embedding-3-small"
    ).data[0].embedding