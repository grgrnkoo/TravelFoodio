import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
<<<<<<< HEAD
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../../_lib/client";
import { sendVerificationRequest } from "../../../../../_lib/sendVerificationRequest";
=======
import EmailProvider from 'next-auth/providers/email'
import dbConnect from "../../../../../_lib/dbConnect";
import User from "../../../../../models/User";
import { sendVerificationRequest } from '../../../../../_lib/authSendRequest';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../../_lib/clientPromise";
>>>>>>> main

const handler = NextAuth({
    // Google Authentication
    providers: [
        GoogleProvider
            ({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            }),
<<<<<<< HEAD
        {
            name: 'http-email',
            id: 'resend',
            type: 'email',
            maxAge: 60 * 60 * 1000, // Email link will expire in 1 hour
            sendVerificationRequest
        }
    ],
    callbacks: {
        
    },
=======
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            sendVerificationRequest(identifier, url, provider)
        }),
    ],
>>>>>>> main
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login'
    },
    adapter: MongoDBAdapter(clientPromise)
})

export { handler as GET, handler as POST }