import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import UserProfile from "@/components/UserProfile";
import { getUserByEmail } from "../../../_lib/actions";


export default async function Dashboard({ children }) {
    // Dashboard page
    const session = await getServerSession(authOptions);
    // const session = await getServerSession();

    const userProfile = await getUserByEmail(session?.user?.email);

    console.log('Session: ', session);
    console.log('User: ', userProfile);

    return (
        <>
            <UserProfile />
            {children && React.isValidElement(children) 
                ? React.cloneElement(children, { userProfile }) 
                : null}
        </>
    );
}