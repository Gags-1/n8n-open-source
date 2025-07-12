from PyPDF2 import PdfWriter
import io
from app.models.state import State

def pdf_node(state: State, **params) -> State:
    writer = PdfWriter()
    writer.add_blank_page(width=72*8.5, height=72*11)
    
    # Add text
    packet = io.BytesIO()
    writer.write(packet)
    
    state["pdf"] = {
        "content": packet.getvalue(),
        "filename": params.get("filename", "output.pdf")
    }
    return state