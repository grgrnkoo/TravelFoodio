import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../../_lib/client";
import { sendVerificationRequest } from "../../../../../_lib/sendVerificationRequest";
import { addUsername } from "../../../../../_lib/actions";

const handler = NextAuth({
    // Google Authentication
    providers: [
        GoogleProvider
            ({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                profile(profile) {
                    return {
                        id: profile.sub,
                        name: profile.name,
                        email: profile.email,
                        username: profile.email.split('@')[0],
                        image: profile.picture,
                    }
                },
                allowDangerousEmailAccountLinking: true
            }),
        {
            id: 'resend',
            type: 'email',
            maxAge: 60 * 60, // Email link will expire in 1 hour
            sendVerificationRequest,
            allowDangerousEmailAccountLinking: true,
        }
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log('Profile sub: ', profile.sub)
            if (account.provider === 'resend') {
                // Extract the username from the email
                if (user.email) {
                    user.username = user.email.split('@')[0];
                }
            }
            return true; // Continue with the sign-in process
        },
        async session({ session, user }) {
            // Add the username to the session object
            if (user?.username) {
                session.user.username = user.username;
            }
            return session;
        },
        async jwt({ token, user }) {
            // Add the username to the JWT token
            if (user?.username) {
                token.username = user.username;
            }
            return token;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl + '/dashboard';
        }
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login'
    },
    adapter: MongoDBAdapter(clientPromise)
})

export { handler as GET, handler as POST }