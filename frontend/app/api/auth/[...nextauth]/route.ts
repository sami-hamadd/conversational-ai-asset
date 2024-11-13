// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import axios from "axios";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Make the request backend to validate the credentials
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await axios.post(`${apiUrl}/api/v1/auth/token/`, new URLSearchParams({

            username: credentials?.username || "",
            password: credentials?.password || "",
          }));

          const user = res.data;

          const status = res.status;
          // If login is successful and user object contains access token and username
          if (status === 200 && user) {
            return {
              ...user,
              username: credentials?.username, // Add the username to the user object
            };
          }

          return null;

        } catch (error: any) {

          const status = error?.status;
          if (status) {          // Handle 401 unauthorized errors
            if (status === 401) {
              throw new Error('Wrong email or password.');
            }
            // Handle other error types like 500 (internal server error)
            else if (status === 500) {
              throw new Error('Internal server error. Please try again later.');
            }
          }
          // Handling all other error cases
          throw new Error('Something went wrong. Please try again later.');
        }
      }


    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.username = user.username; // Add username to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = {
        ...session.user,
        username: token.username as string, // Add username to the session
      };
      return session;
    },
  },


  secret: process.env.NEXTAUTH_SECRET,
};

// Export the NextAuth handler using Next.js route handler format
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
