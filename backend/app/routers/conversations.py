from datetime import datetime
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from app.models.conversation import Conversation, ConversationCreate
from app.models.message import FeedbackUpdate, MessageCreate, Message
from app.utils import call_llm_invoke, call_speech_to_text, store_message
from google.cloud import firestore
from app.dependencies import client, get_current_user, USERS_COLLECTION

router = APIRouter()

@router.post("/")
def create_conversation(
    conversation_create: ConversationCreate,
    current_user: dict = Depends(get_current_user)
):
    # Generate a unique conversation ID
    conv_id = str(uuid.uuid4())  # Generate a random UUID for conversation_id
    
    # Create conversation data
    conversation_data = Conversation(
        conversation_id=conv_id,
        title=conversation_create.title,
        last_interaction=str(datetime.utcnow()),
        messages=[]
    )
    conversation_dict = conversation_data.dict()

    # Query Firestore for the user document based on username
    user_ref = client.collection(USERS_COLLECTION).where("username", "==", current_user["username"]).limit(1).stream()
    user_docs = list(user_ref)

    if not user_docs:
        raise HTTPException(status_code=404, detail="User not found")

    # Reference to the user's document
    user_doc = user_docs[0].reference

    # Update the user's conversations by appending the new conversation
    user_doc.update({
        "conversations": firestore.ArrayUnion([conversation_dict])
    })

    return {"conversation_id": conversation_dict["conversation_id"], "title": conversation_dict["title"]}

@router.get("/")
def get_conversations(
    current_user: dict = Depends(get_current_user)
):
    # Query Firestore to retrieve the user document based on username
    user_query = client.collection(USERS_COLLECTION).where("username", "==", current_user["username"]).limit(1).stream()
    user_docs = list(user_query)

    # Handle case where the user is not found
    if not user_docs:
        raise HTTPException(status_code=404, detail="User not found")

    # Retrieve conversations from the user document
    user_entity = user_docs[0].to_dict()
    conversations = user_entity.get("conversations", [])

    return {"conversations": conversations}


@router.delete("/{conversation_id}/")
def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Query Firestore to retrieve the user document based on username
    user_query = client.collection(USERS_COLLECTION).where("username", "==", current_user["username"]).limit(1).stream()
    user_docs = list(user_query)

    # Check if the user was found
    if not user_docs:
        raise HTTPException(status_code=404, detail="User not found")

    # Get the user document reference and data
    user_doc = user_docs[0].reference
    user_data = user_docs[0].to_dict()

    # Retrieve the current conversations and filter out the one to delete
    original_conversations = user_data.get("conversations", [])
    updated_conversations = [conv for conv in original_conversations if conv["conversation_id"] != conversation_id]

    # Check if a conversation was actually removed
    if len(updated_conversations) == len(original_conversations):
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Update Firestore with the modified conversations list
    user_doc.update({
        "conversations": updated_conversations
    })

    return {"message": "Conversation deleted successfully"}
