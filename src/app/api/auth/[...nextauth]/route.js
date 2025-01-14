import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../../_lib/client";
import { sendVerificationRequest } from "../../../../../_lib/sendVerificationRequest";

const handler = NextAuth({
    // Google Authentication
    providers: [
        GoogleProvider
            ({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            }),
        {
            name: 'http-email',
            id: 'resend',
            type: 'email',
            maxAge: 60 * 60, // Email link will expire in 1 hour
            sendVerificationRequest
        }
    ],
    callbacks: {
        
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login'
    },
    adapter: MongoDBAdapter(clientPromise)
})

export { handler as GET, handler as POST }