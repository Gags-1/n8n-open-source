from fpdf import FPDF
from app.models.state import State

def pdf_node(state: State, **params) -> State:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, str(state["current_output"]))
    
    pdf_output = pdf.output(dest='S').encode('latin1')
    state["pdf"] = {
        "content": pdf_output,
        "filename": params.get("filename", "report.pdf")
    }
    return state