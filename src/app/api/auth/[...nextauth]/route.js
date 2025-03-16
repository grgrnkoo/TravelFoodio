// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../../_lib/client";
import { sendVerificationRequest } from "../../../../../_lib/sendVerificationRequest";
import { getUserByEmail } from "../../../../../_lib/actions";

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
            try {
                const client = await clientPromise;
                const db = client.db();
                const username = user.email.split("@")[0];

                // Check if user exists
                const existingUser = await db.collection("users").findOne({ email: user.email });

                if (!existingUser) {
                    await db.collection("users").insertOne({
                        email: user.email,
                        username,
                        name: user.name,
                        image: user.image,
                        onboardingCompleted: false,
                    });
                    user.username = username;
                    user.onboardingCompleted = false;
                } else {
                    user.username = existingUser.username;

                    if (!existingUser.onboardingCompleted) {
                        const booleanOnboarding = !!(
                            existingUser.goals ||
                            existingUser.dietaryRestrictions ||
                            existingUser.age ||
                            existingUser.location ||
                            existingUser.dailyCaloriesSuggested
                        );

                        if (existingUser.onboardingCompleted !== booleanOnboarding) {
                            await db.collection("users").updateOne(
                                { email: user.email },
                                { $set: { onboardingCompleted: booleanOnboarding } }
                            );
                        }
                    }
                }

                return true;
            } catch (error) {
                console.error("Sign-in error:", error);
                return false;
            }
        },
        async jwt({ token = {}, user, account, trigger }) {
            const currentTime = Math.floor(Date.now() / 1000);
            const bufferTime = 15 * 60; // 15 minutes
        
            if (user && account) {
                token.email = user.email;
                token.username = user.username;
                token.onboardingCompleted = user.onboardingCompleted ?? false;
                token.exp = currentTime + 24 * 60 * 60 * 10;
                return token;
            }
        
            if (trigger === "update" && token?.email) {  // Ensure token is defined
                try {
                    const updatedUser = await getUserByEmail(token.email);
                    if (!updatedUser) throw new Error("User not found");
        
                    token.username = updatedUser.username;
                    token.onboardingCompleted = updatedUser.onboardingCompleted;
                } catch (error) {
                    console.error("User update error:", error);
                    token.error = "UserUpdateError";
                }
                return token;
            }
        
            if (token?.exp && currentTime > token.exp - bufferTime) {
                try {
                    if (!token.email) throw new Error("Token has no email");
        
                    const updatedUser = await getUserByEmail(token.email);
                    if (!updatedUser) throw new Error("User not found");
        
                    token.username = updatedUser.username;
                    token.onboardingCompleted = updatedUser.onboardingCompleted;
                    token.exp = currentTime + 24 * 60 * 60 * 10;
                } catch (error) {
                    console.error("Token refresh error:", error);
                    return { ...token, error: "RefreshAccessTokenError" };
                }
            }
        
            return token;
        },        
        async session({ session, token }) {
            if (token.error) {
                session.error = token.error;
            } else {
                session.user.username = token.username;
                session.user.onboardingCompleted = token.onboardingCompleted;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60 * 10, // 10 days
        updateAge: 15 * 60, // Refresh every 15 minutes
    },
    secret: process.env.NEXTAUTH_SECRET,
    jwt: { encryption: false }, // Disables AES-GCM
    pages: { signIn: "/login" },
    adapter: MongoDBAdapter(clientPromise),
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
