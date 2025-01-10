import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
// import { authConfig } from "../../../../../_lib/auth";

const handler = NextAuth({
    providers: [
        GoogleProvider
            ({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        login: '/login'
    }
})

export { handler as GET, handler as POST }