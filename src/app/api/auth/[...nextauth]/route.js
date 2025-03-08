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
            let username = ''
            if (account.provider === "resend") {
                const client = await clientPromise;
                const db = client.db();
                // Check if user exists in MongoDB
                const existingUser = await db.collection("users").findOne({ email: user.email });
                if (!existingUser || !existingUser.username) {
                    // Assign username if missing
                    username = user.email.split("@")[0];
                    // Update or insert user with username
                    await db.collection("users").updateOne(
                        { email: user.email },
                        { $set: { username, email: user.email } },
                        { upsert: true }
                    );
                    user.username = username; // Ensure user object has it
                } else {
                    user.username = existingUser.username; // Use existing username
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user?.username) {
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.username) {
                session.user.username = token.username;
            }
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