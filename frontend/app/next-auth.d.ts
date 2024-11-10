import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken: string;
        user: {
            username: string;
        };
    }
    interface User {
        access_token: string;
        username: string;
    }
}
