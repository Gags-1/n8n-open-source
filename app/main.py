# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.workflow import run_workflow

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    node_id: str
    user_query: str

@app.get("/")
def test():
    return {"message":"working"}

@app.post("/query")
async def handle_query(req: QueryRequest):
    result = run_workflow(req.node_id, req.user_query)
    return {"result": result}
