from typing import List
from pydantic import BaseModel
from app.models.conversation import Conversation

class User(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    username: str
    conversations: List[Conversation] = []  # Conversations associated with the user