from pydantic import BaseModel
from typing import List, Dict, Optional


class WorkflowConnection(BaseModel):
    source: str
    target: str
    condition: Optional[str] = None 
    label: Optional[str] = None

class WorkflowDefinition(BaseModel):
    nodes: List[str]
    connections: List[WorkflowConnection]
    entry_node: str = "start"
    exit_node: str = "end"