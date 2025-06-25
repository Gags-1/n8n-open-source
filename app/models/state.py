from typing import TypedDict, Optional, Dict, Any

class State(TypedDict):
    user_query: str
    current_output: Optional[Any]  # Output from previous node
    openai_api_key: Optional[str]
    hashnode_token: Optional[str]
    hashnode_publication_id: Optional[str]
    email_config: Optional[Dict[str, str]]  # For Gmail node