import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from "../../../../../_lib/dbConnect";
import User from "../../../../../models/User";

const handler = NextAuth({
    providers: [
        GoogleProvider
            ({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET
            }),
    ],
    callbacks: {
        async signIn({ user }) {
            try {
                await dbConnect();

                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    const newUser = await User.create({
                        email: user.email,
                        username: user.email.split('@')[0]
                    });

                    console.log('User created: ', newUser)
                }

                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        },
        async session({ session, token }) {
            const dbUser = await User.findOne({ email: session.user.email });
            session.user.id = dbUser?._id;
            session.user.username = dbUser?.username;
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        login: '/login'
    }
})

export { handler as GET, handler as POST }