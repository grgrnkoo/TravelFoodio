import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import UserProfile from "@/components/UserProfile";
import { getUserByEmail } from "../../../_lib/actions";
import UserProvider from "@/components/UserProvider";

// export const UserContext = createContext(null);

export default async function DashboardLayout({ children }) {
    // Dashboard page
    const session = await getServerSession(authOptions);
    // const session = await getServerSession();

    const userProfile = await getUserByEmail(session?.user?.email);

    console.log('Session: ', session);
    console.log('User: ', userProfile);

    return (
        <UserProvider value ={{session, userProfile}}>
            <UserProfile />
            {children}
        </UserProvider>
    );
}