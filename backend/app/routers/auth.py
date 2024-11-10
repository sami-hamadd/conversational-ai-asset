from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.dependencies import client, USERS_COLLECTION, verify_password, create_access_token
from app.models.token import Token
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/token/", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Query Firestore for the user document based on the username
    user_query = client.collection(USERS_COLLECTION).where("username", "==", form_data.username).limit(1).stream()
    user_docs = list(user_query)

    # Check if user exists and verify password
    if not user_docs or not verify_password(form_data.password, user_docs[0].to_dict().get("hashed_password")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user data
    user = user_docs[0].to_dict()
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}
