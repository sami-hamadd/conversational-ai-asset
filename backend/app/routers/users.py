from fastapi import APIRouter, HTTPException
from app.dependencies import client, get_password_hash, USERS_COLLECTION  # Firestore client and collection name
from app.models.user import User, UserResponse

router = APIRouter()

@router.post("/sign_up/", response_model=UserResponse)
def sign_up(user: User):
    # Check if user already exists in Firestore
    user_query = client.collection(USERS_COLLECTION).where("username", "==", user.username).limit(1).stream()
    existing_user = list(user_query)
    
    if existing_user:  # If the user already exists
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Prepare user data
    user_data = {
        "username": user.username,
        "hashed_password": hashed_password,
        "conversations": []
    }
    
    # Insert new user into Firestore
    client.collection(USERS_COLLECTION).add(user_data)
    
    return UserResponse(username=user.username)
