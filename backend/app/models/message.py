from typing import Dict, List, Optional, Union
from pydantic import BaseModel


class Question(BaseModel):
    type: str  # Can be 'AUDIO', 'TEXT', etc.
    content: str  # The actual content of the question
    transcription: Optional[str] = None # Optional transcription if the type is AUDIO


class Answer(BaseModel):
    type: str  # Type is always 'TEXT', since the genai module always return text responses.
    content: Union[str, Dict, List[Dict]]  # The actual content of the answer
    generated_chart: Optional[Union[str, Dict,]] = None # Optional for the visualization agent responses


class Message(BaseModel):
    message_id: str              
    question: Question  # Contains both type and content for the question
    answer: Answer  # Contains both type and content for the answer
    timestamp: Optional[str]
    feedback: Optional[str] = None  # Feedback can be 'LIKE' or 'DISLIKE'
    tools: Optional[Dict] = None    # Added field
    data: Optional[List[Dict]] = None  # Added field


class MessageCreate(BaseModel):
    question: Question  # The new structure for creating messages with question type and content


class FeedbackUpdate(BaseModel):
    feedback: str  # Feedback for messages, 'LIKE' or 'DISLIKE'


class VoiceMessageCreate(BaseModel):
    base64_audio: str  # Encoded audio data for voice messages
