from app.nodes.hashnode import hashnode_node
from app.nodes.openai import openai_node
from app.nodes.email import email_node
from app.nodes.claude import claude_node
from app.nodes.gemini import gemini_node
from app.nodes.webhook import webhook_node

node_registry = {
    "openai": openai_node,
    "hashnode": hashnode_node,
    "email": email_node,
    "claude": claude_node,  
    "gemini": gemini_node ,
    "webhook": webhook_node

}