import os
from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.conversations import router as conversations_router
from app.routers.messages import router as messages_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.config import BACKEND_URL, FRONTEND_URL, GENAI_API_URL


app = FastAPI(
    title="Users & Conversations Management API",
    description="API for handling authentication, user management, and conversations.",
    version="1.0.0"
)


origins = [
    FRONTEND_URL,
    BACKEND_URL,
    GENAI_API_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# The following line should be commented in production!
load_dotenv() # Comment this line if you don't want to read the environment variables from a .env file!


# Register routes
# Register routes with a versioned prefix
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(conversations_router, prefix="/api/v1/conversations", tags=["Conversations"])
app.include_router(messages_router, prefix="/api/v1/conversations", tags=["Messages"])

