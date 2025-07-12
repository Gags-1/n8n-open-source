from app.models.state import State
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

def text_editor_node(state: State, **params) -> State:
    """
    Processes text with:
    - Formatting (Markdown/HTML)
    - Manual edits
    - Template variables
    """
    try:
        # Get input text (from previous node or params)
        input_text = params.get("text") or str(state.get("current_output", ""))
        
        # Apply transformations
        if params.get("format") == "markdown":
            input_text = f"```markdown\n{input_text}\n```"
        elif params.get("format") == "html":
            input_text = f"<pre>{input_text}</pre>"
        
        # Apply user edits if provided
        if params.get("edits"):
            for edit in params["edits"]:
                input_text = input_text.replace(edit["find"], edit["replace"])
        
        # Store processed text
        state["current_output"] = {
            "text": input_text,
            "format": params.get("format", "plaintext"),
            "status": "processed"
        }
        
    except Exception as e:
        logger.error(f"Text editor failed: {str(e)}")
        state["current_output"] = {
            "error": str(e),
            "status": "failed"
        }
    
    return state