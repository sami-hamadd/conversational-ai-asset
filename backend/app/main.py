import os
from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.conversations import router as conversations_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.config import BACKEND_URL, FRONTEND_URL, GENAI_API_URL


app = FastAPI()


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
load_dotenv()
# Register routes
app.include_router(auth_router, tags=["Auth"])
app.include_router(conversations_router, tags=["Conversations"])
app.include_router(users_router,tags=["Users"])
