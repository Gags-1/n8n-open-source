from typing import TypedDict, Optional, Dict, Any, Union, List

class State(TypedDict):
    user_query: str
    current_output: Optional[Union[str, Dict, List]]
    workflow_id: Optional[str]  # For tracking
    
    
    api_keys: Dict[str, str] 
    # # Node-specific configurations
    # llm_config: Optional[Dict[str, Any]] 
    # http_config: Optional[Dict[str, Any]] 
    # file_output: Optional[Dict[str, str]] 
    
    #Legacy nodes (might delete)
    openai_api_key: Optional[str]
    hashnode_token: Optional[str]
    hashnode_publication_id: Optional[str]
    email_config: Optional[Dict[str, str]]
    webhook_url: Optional[str]