from app.nodes.hashnode import hashnode_node
from app.nodes.openai import openai_node
from app.nodes.openai_advanced import openai_advanced_node
from app.nodes.email import email_node
from app.nodes.claude import claude_node
from app.nodes.gemini import gemini_node
from app.nodes.webhook import webhook_node
from app.nodes.gemini_advanced import gemini_advanced_node
from app.nodes.mongodb import mongodb_node
from app.nodes.text_node import text_download_node


node_registry = {
    "openai": openai_node,
    "openai/advanced": openai_advanced_node,
    "hashnode": hashnode_node,
    "email": email_node,
    "claude": claude_node,  
    "gemini": gemini_node ,
    "gemini/advanced": gemini_advanced_node ,
    "webhook": webhook_node,
    "mongodb": mongodb_node,
    "text": text_download_node
    

}