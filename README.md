
# Conversational AI Asset

This project includes a **front-end** built with **Next.js** and **TypeScript**, and a **back-end** powered by **FastAPI** and **Google Firestore**.
----------------------------------------------------
### Running Application Locally

Please ensure you have setup a valid google cloud account with correct permessions (firestore), as we will store the credentials later in a firestore DB

#### Frontend Setup (Next.js)
#### Prerequisites

Before getting started, ensure you have the following installed:
- **Node.js** version 20.17.X or later
- **npm** or **yarn** (for managing Node.js packages)
  
#### Environment vairables
Before filling the vairables, please follow this website: [https://generate.plus/en/base64#google_vignette], and copy the generated secret  
For local development you need to create a `.env.local` file inside the frontend directory, and you should fill it with the following variables:
```
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
```
**Note:** these environment variables are required for production:
  - NEXTAUTH_SECRET: Secret key for securing NextAuth.js tokens. this should be set, as there's no default
  - NEXTAUTH_URL: Base URL of the Next.js app. this should be set, as there's no default
  - NEXT_PUBLIC_API_URL: URL of the backend API (the fastapi application of the backend). default is: http://localhost:8000
  - NEXT_PUBLIC_GENAI_URL: URL for the Generative AI service API (the fastapi application for the backend). default is: http://localhost:8080

##### Installation & Running the Frontend Server

1. Head to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies, and wait for the dependencies to be installed:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.


##### Backend Setup (FastAPI)

##### Prerequisites

- **Python** version 3.10 or later
- **pip** (Python package manager)
- **Google Cloud Account Setup**

#### Environment vairables
For local development You need to ensure a successful set up of GCP account locally, and with the correct project selected locally  
For local development you need to create a `.env` file inside the backend directory, and you should fill it with the following variables:
```
FIRESTORE_PROJECT_ID=your_gcp_project_id
```
**Note:** these environment variables are required for production:
  - FRONTEND_URL: Base URL of the Next.js app. default is: http://localhost:3000
  - BACKEND_URL: URL of the backend API. default is: http://localhost:8000
  - GENAI_API_URL: URL of the backend API. default is: http://localhost:8080
  - SECRET_KEY: This is optional, (it is handled in code with a random generated key), Secret key for encoding and decoding JWT tokens.
  - ALGORITHM: This is optional, Algorithm used for JWT token encoding, default is HS256.
  - ACCESS_TOKEN_EXPIRE_MINUTES: This is optional, Duration in minutes for which an access token remains valid, default is 480 minutes (8 hours).

###### Installation & Running the Backend Server

1. Head to the backend repository

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   - For Mac/Linux:

     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

   - For Windows:

     ```bash
     python -m venv .venv
     .\.venv\Scripts\Activate
     ```

3. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:

   ```bash
   uvicorn app.main:app --reload
   ```

   The backend server will be available at: [http://localhost:8000](http://localhost:8000)


Now, both the frontend ([http://localhost:3000](http://localhost:3000)) and the backend ([http://localhost:8000](http://localhost:8000)) should be running.
1. Create a user by heading to register page.
2. Enter your crdentials
3. After a successful registration, you will get a feedback message, then redirected to the login page
4. You can then login using the frontend page
