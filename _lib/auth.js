import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { getServerSession, NextAuthOptions, User } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import { Magic } from "magic-sdk";

import mongoose from "mongoose";

export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ]
}