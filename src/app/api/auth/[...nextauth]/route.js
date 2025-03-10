// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../../_lib/client";
import { sendVerificationRequest } from "../../../../../_lib/sendVerificationRequest";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    username: profile.email.split("@")[0],
                    image: profile.picture,
                };
            },
            allowDangerousEmailAccountLinking: true,
        }),
        {
            id: "resend",
            type: "email",
            maxAge: 60 * 60,
            sendVerificationRequest,
            allowDangerousEmailAccountLinking: true,
        },
    ],
    callbacks: {
        async signIn({ user, account }) {
            console.log("SignIn - Provider:", account.provider);
            if (account.provider === "resend") {
                const client = await clientPromise;
                const db = client.db();
                const username = user.email.split("@")[0];

                // Check if user exists in MongoDB
                const existingUser = await db.collection("users").findOne({ email: user.email });
                if (!existingUser) {
                    await db.collection("users").insertOne({
                        email: user.email,
                        username: username,
                        goals: undefined,
                        dietaryRestrictions: undefined,
                        age: undefined,
                        cuisinePreferences: undefined,
                    });
                    user.username = username;
                    user.onboardingCompleted = false;
                } else {
                    user.username = existingUser.username;
                    user.onboardingCompleted = !!(
                        existingUser.goals === '' &&
                        existingUser.dietaryRestrictions === '' &&
                        existingUser.age === '' &&
                        existingUser.cuisinePreferences === ''
                    );
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user?.username) {
                token.username = user.username;
                token.onboardingCompleted = user.onboardingCompleted;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.username = token.username;
            session.user.onboardingCompleted = token.onboardingCompleted;
            return session;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl + "/dashboard";
        },
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: "/login" },
    adapter: MongoDBAdapter(clientPromise),
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };