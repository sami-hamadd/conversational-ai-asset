from datetime import datetime
import os
from typing import Dict, List
from fastapi import HTTPException
import httpx
from app.dependencies import USERS_COLLECTION, client
from app.config import GENAI_API_URL

async def call_speech_to_text(base64_audio: str) -> str:
    url = f"{GENAI_API_URL}/speech/speech-to-text"
    
    try:        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json={"audio_base64": base64_audio})
            print(response)
        if response.status_code == 200:
            transcription = response.json().get("transcription")
            if transcription:
                print("STT transcription:", transcription)
                return transcription
            else:
                print("STT service returned an empty transcription")
                return None
        else:
            print("Error calling STT service:", response.content)
            return None
    except Exception as e:
        print("Error in STT service:", str(e))
        return None
    

async def call_llm_invoke(message: str, session_id: str, user_name: str, create_time: str, message_id: str):
    url = f"{GENAI_API_URL}/llm/invoke"
    payload = {
        "input": {
            "message": message,
            "session_id": session_id,
            "user_name": user_name,
            "createTime": create_time,
            "message_id": message_id
        }
    }
    ERR_MESSAGE="Sorry, an error occurred generating the response."
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("output", {"content": "No response from LLM"})
        except httpx.HTTPStatusError as e:
            update_message_content(session_id, user_name, message_id, ERR_MESSAGE)
            return None
            
        except Exception as e:
            print(f"An error occurred: {e}")
            update_message_content(session_id, user_name, message_id, ERR_MESSAGE)
            return None


def store_message(conversation_id, current_user, message_data):
    # Query Firestore to retrieve the user document
    user_query = client.collection(USERS_COLLECTION).where("username", "==", current_user["username"]).limit(1).stream()
    user_docs = list(user_query)

    if not user_docs:
        raise HTTPException(status_code=404, detail="User not found")

    user_doc = user_docs[0].reference  # Reference to the user's document
    user_data = user_docs[0].to_dict()

    # Find the specified conversation and update it with the new message
    conversations = user_data.get("conversations", [])
    conversation_found = False

    for conversation in conversations:
        if conversation["conversation_id"] == conversation_id:
            conversation["messages"].append(message_data)
            conversation["last_interaction"] = str(datetime.utcnow())
            conversation_found = True
            break

    if not conversation_found:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Update Firestore with the modified conversations list
    user_doc.update({
        "conversations": conversations
    })


def update_message_content(conversation_id: str, current_user: str, message_id: str, content: str):
    """
    Updates the answer content for a specific message in Firestore.
    """
    # Query Firestore to retrieve the user document
    user_query = client.collection(USERS_COLLECTION).where("username", "==", current_user).limit(1).stream()
    user_docs = list(user_query)

    if not user_docs:
        raise HTTPException(status_code=404, detail="User not found")

    user_doc = user_docs[0].reference  # Reference to the user's document
    user_data = user_docs[0].to_dict()

    # Find the specified conversation and message
    conversations = user_data.get("conversations", [])
    conversation_found = False
    message_found = False

    for conversation in conversations:
        if conversation["conversation_id"] == conversation_id:
            conversation_found = True
            for message in conversation["messages"]:
                if message["message_id"] == message_id:
                    message["answer"]["content"] = content
                    message_found = True
                    break
            break

    if not conversation_found:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if not message_found:
        raise HTTPException(status_code=404, detail="Message not found")

    # Update Firestore with the modified conversations list
    user_doc.update({
        "conversations": conversations
    })
