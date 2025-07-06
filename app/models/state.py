from typing import TypedDict, Optional, Dict, Any, Union, List

class State(TypedDict):
    user_query: str
    current_output: Optional[Union[str, Dict, List]]
    workflow_id: Optional[str]
    api_keys: Dict[str, str]
    
    node_params: Optional[Dict[str, Dict[str, Any]]]
    
    # Legacy fields (deprecated but kept for compatibility)
    openai_api_key: Optional[str]
    hashnode_token: Optional[str]
    hashnode_publication_id: Optional[str]
    email_config: Optional[Dict[str, str]]
    webhook_url: Optional[str]