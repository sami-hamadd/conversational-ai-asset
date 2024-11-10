from typing import List, Optional
from pydantic import BaseModel
from app.models.message import Message

class Conversation(BaseModel):
    conversation_id: str
    title: str
    last_interaction: Optional[str]
    messages: List[Message] = []  # List of messages in the conversation


class ConversationCreate(BaseModel):
    title: str  # Title for creating a new conversation
