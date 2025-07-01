import psycopg2
from psycopg2.extras import RealDictCursor
from app.models.state import State


def postgresql_node(state: State) -> State:
    params = state.get("node_params", {}).get("postgresql", {})
    conn = psycopg2.connect(
        state["api_keys"]["postgres_uri"],
        cursor_factory=RealDictCursor
    )
    
    try:
        if params.get("transaction"):
            conn.autocommit = False
        
        with conn.cursor() as cur:
            cur.execute(params["query"], params.get("parameters", []))
            
            if cur.description:  # For SELECT queries
                state["current_output"] = cur.fetchall()
            else:  # For INSERT/UPDATE/DELETE
                state["current_output"] = {"rowcount": cur.rowcount}
                
        if params.get("transaction"):
            conn.commit()
    except Exception as e:
        if params.get("transaction"):
            conn.rollback()
        raise ValueError(f"PostgreSQL error: {str(e)}")
    finally:
        conn.close()
    
    return state