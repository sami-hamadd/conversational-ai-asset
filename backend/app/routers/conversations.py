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

@router.post("/create_conversation/")
def create_conversation(conversation_create: ConversationCreate, current_user: dict = Depends(get_current_user)):
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


@router.post("/create_message_text/{conversation_id}/")
async def create_text_message(
    conversation_id: str,
    message_create: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    # Generate a unique message ID
    message_id = str(uuid.uuid4())

    question_data = {
        "type": message_create.question.type,
        "content": message_create.question.content
    }

    # Prepare initial message data with empty fields
    message_data = {
        "message_id": message_id,
        "question": question_data,
        "answer": {
            "type": "TEXT",
            "content": "This is a test, but it should be empty and will be filled by genAI Agent",  # Will be filled by GenAI module
            "generated_chart": None  # Will be filled by GenAI module
        },
        "data": None,   # Will be filled by GenAI module
        "tools": None,  # Will be filled by GenAI module
        "feedback": None,  # Default to None
        "timestamp": str(datetime.utcnow())
    }

    # Store the new message in Firestore
    store_message(conversation_id, current_user, message_data)

    # Now call LLM invoke, passing message_id
    # response = await call_llm_invoke(
    #     message=question_data['content'],
    #     session_id=conversation_id,
    #     user_name=current_user['username'],
    #     create_time=message_data['timestamp'],
    #     message_id=message_id
    # )

    response = message_data["answer"]

    # Return the message ID to the client
    return {"message_id": message_id, "genai_response": response}



@router.post("/create_message_audio/{conversation_id}/")
async def create_audio_message(
    conversation_id: str,
    message_create: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    # Generate a unique message ID
    message_id = str(uuid.uuid4())

    # Set up the initial question data for an audio message
    question_data = {
        "type": message_create.question.type,
        "content": message_create.question.content  # Use actual audio content
    }

    # Attempt speech-to-text conversion on the audio content
    stt_result = await call_speech_to_text(question_data['content'])
    STT_ERR_MSG="Hmm, I had a little trouble understanding that. Could you give it another try? 😊"
    if stt_result:
        question_data["transcription"] = stt_result
    else:
        question_data["transcription"] = None

    # Prepare initial message data with empty fields for GenAI completion
    message_data = {
        "message_id": message_id,
        "question": question_data,
        "answer": {
            "type": "TEXT",
            "content": "",  # To be filled by GenAI module
            "generated_chart": None  # To be filled by GenAI module, if applicable
        },
        "data": None,   # To be filled by GenAI module, if applicable
        "tools": None,  # To be filled by GenAI module, if applicable
        "feedback": None,  # Default to None
        "timestamp": str(datetime.utcnow())
    }

    # Store the initial message in Firestore
    response=None
    if stt_result:
        store_message(conversation_id, current_user, message_data)
        # Call the LLM invoke function with transcription
        response = await call_llm_invoke(
            message=question_data["transcription"],
            session_id=conversation_id,
            user_name=current_user["username"],
            create_time=message_data["timestamp"],
            message_id=message_id
        )
    else:
        message_data["answer"]["content"] = STT_ERR_MSG
        store_message(conversation_id, current_user, message_data)

    # Return the message ID to the client, indicating that message has been created
    if response:
        return {"message_id": message_id, "genai_response": response}
    else:
        return {"message_id": message_id, "genai_response": STT_ERR_MSG}



@router.get("/conversations/")
def get_conversations(current_user: dict = Depends(get_current_user)):
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


@router.get("/conversations/{conversation_id}/messages/")
def get_conversation_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    # Query Firestore to retrieve the user document
    user_query = client.collection(USERS_COLLECTION).where("username", "==", current_user["username"]).limit(1).stream()
    user_docs = list(user_query)

    # Handle case where the user is not found
    if not user_docs:
        raise HTTPException(status_code=404, detail="User not found")

    # Retrieve the user entity and find the specific conversation
    user_entity = user_docs[0].to_dict()
    conversation = next(
        (conv for conv in user_entity.get("conversations", []) if conv["conversation_id"] == conversation_id),
        None
    )

    # Handle case where the conversation is not found
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Sort the messages by timestamp
    messages = sorted(conversation.get("messages", []), key=lambda msg: msg["timestamp"])

# Process each message to ensure `generated_chart` is properly decoded from JSON string if necessary
    for msg in messages:
        answer = msg.get("answer", {})
        generated_chart = answer.get("generated_chart")
        if isinstance(generated_chart, str):
            try:
                # Decode `generated_chart` from JSON string to dictionary
                answer["generated_chart"] = json.loads(generated_chart)
            except json.JSONDecodeError:
                answer["generated_chart"] = None  # Set to None if decoding fails

    # Use Pydantic models to format and validate the messages
    formatted_messages = [Message(**msg) for msg in messages]
    last_interaction = conversation.get("last_interaction")

    return {
        "conversation_id": conversation_id,
        "last_interaction": last_interaction,
        "messages": formatted_messages  # Return the messages in the new structure
    }


@router.delete("/delete_conversation/{conversation_id}")
def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
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


@router.put("/conversations/{conversation_id}/messages/{message_id}/feedback")
def update_feedback(conversation_id: str, message_id: str, feedback_update: FeedbackUpdate, current_user: dict = Depends(get_current_user)):
    # Validate feedback value
    feedback = feedback_update.feedback
    if feedback not in ["LIKE", "DISLIKE"]:
        raise HTTPException(status_code=400, detail="Invalid feedback value")

    # Query Firestore to retrieve the user document based on username
    user_query = client.collection(USERS_COLLECTION).where("username", "==", current_user["username"]).limit(1).stream()
    user_docs = list(user_query)

    if not user_docs:
        raise HTTPException(status_code=404, detail="User not found")

    user_doc = user_docs[0].reference  # Reference to the user's document
    user_data = user_docs[0].to_dict()

    conversation_found = False
    message_found = False

    # Locate the conversation and message within user's conversations
    conversations = user_data.get("conversations", [])
    for conversation in conversations:
        if conversation["conversation_id"] == conversation_id:
            conversation_found = True
            for message in conversation["messages"]:
                if message["message_id"] == message_id:
                    message["feedback"] = feedback  # Update feedback
                    message_found = True
                    break
            break

    # Error handling if conversation or message not found
    if not conversation_found:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if not message_found:
        raise HTTPException(status_code=404, detail="Message not found")

    # Save the updated conversations list back to Firestore
    user_doc.update({
        "conversations": conversations
    })

    return {"message": "Feedback updated successfully"}

