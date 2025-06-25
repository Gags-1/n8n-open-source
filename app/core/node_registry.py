from app.nodes.hashnode import hashnode_node
from app.nodes.openai import openai_node
from app.nodes.email import email_node

node_registry = {
    "openai": openai_node,
    "hashnode": hashnode_node,
    "email": email_node,
}