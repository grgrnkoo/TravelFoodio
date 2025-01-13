import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email'
import dbConnect from "../../../../../_lib/dbConnect";
import User from "../../../../../models/User";
import { sendVerificationRequest } from '../../../../../_lib/authSendRequest';
import CustomAdapter from "../../../../../_lib/mongoAdapter";

const handler = NextAuth({
    // Google Authentication
    providers: [
        GoogleProvider
            ({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            }),
        EmailProvider
            ({
                id: 'http-email',
                name: 'resend',
                type: 'email',
                maxAge: 60 * 60 * 24,
                sendVerificationRequest
            })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login'
    },
    adapter: CustomAdapter()
})

export { handler as GET, handler as POST }