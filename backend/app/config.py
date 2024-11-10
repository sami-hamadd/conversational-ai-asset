import os
import secrets
from dotenv import load_dotenv

load_dotenv()

# Firestore Project
FIRESTORE_PROJECT_ID = os.environ.get("FIRESTORE_PROJECT_ID", "your-project-id")

# JWT Settings
SECRET_KEY = os.environ.get("SECRET_KEY", secrets.token_hex(32))
ALGORITHM = os.environ.get("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

# BACKEND & FRONTEND URLs
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
GENAI_API_URL = os.environ.get("GENAI_API_URL", "http://localhost:8080")