from fastapi.responses import FileResponse
import os
from app.models.state import State

def text_download_node(state: State) -> dict:
    params = state.get("node_params", {}).get("text_download", {})
    text_content = str(state["current_output"])
    
    # Generate file path
    filename = params.get("filename", "workflow_output.txt")
    save_path = params.get("save_path", "/tmp")
    filepath = os.path.join(save_path, filename)
    
    # Write file
    with open(filepath, "w") as f:
        f.write(text_content)
    
    # Return download metadata
    return {
        "filepath": filepath,
        "filename": filename,
        "size_bytes": len(text_content.encode('utf-8'))
    }