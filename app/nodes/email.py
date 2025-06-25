import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.models.state import State

def email_node(state: State) -> State:
    if not state.get("current_output"):
        raise ValueError("No content to email from previous node")

    email_config = state["email_config"]
    msg = MIMEMultipart()
    msg.attach(MIMEText(state["current_output"], "plain"))
    msg["Subject"] = "Workflow Output"  # Customize as needed
    msg["From"] = email_config["from_email"]
    msg["To"] = email_config["to_email"]

    try:
        with smtplib.SMTP_SSL(email_config["smtp_server"], email_config["smtp_port"]) as server:
            server.login(email_config["username"], email_config["password"])
            server.send_message(msg)
        state["current_output"] = f"Email sent to {email_config['to_email']}"
    except Exception as e:
        state["current_output"] = f"Email failed: {str(e)}"
    
    return state