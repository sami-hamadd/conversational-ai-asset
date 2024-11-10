# Front End Pages

- To start the frontend webpage:
   - Make sure you have installed node js
   - After installing node js, run the application using shell, by heading to the frontend directory
   - Required Environment Variables
      - NEXTAUTH_SECRET: The secret used to encrypt NextAuth.js session tokens. You can generate a random string for this value.
      - NEXTAUTH_URL: The URL of your Next.js application (e.g., https://your-service-name-region.a.run.app for local development or your deployed URL).
      - NEXT_PUBLIC_API_URL: The base URL for your backend API.
      - NEXT_PUBLIC_GENAI_URL: The URL for the Generative AI service or endpoint used in the application.
   - You should then install app dependencies by running the command "npm install"
   - You can then run the application by running the command "npm run dev" 
