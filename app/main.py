from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.workflow import run_workflow
from typing import List, Dict, Any, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    node_ids: List[str]
    user_query: str
    api_keys: Dict[str, Any]
    node_params: Optional[Dict[str, Dict[str, Any]]] = None

@app.get("/")
def health_check():
    return {"status": "OK"}

@app.post("/query")
async def handle_query(req: QueryRequest):
    try:
        result = run_workflow(req.node_ids, req.user_query, req.api_keys,req.node_params )
        return {"result": result["current_output"]}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))