"use client"

import React, { createContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export const UserContext = createContext({})

export default function UserProvider({ value, children }) {
    const { userProfile } = value;
    const pathname = usePathname();
    const { data: session, update } = useSession(); // Get client-side session
    const [userProfileDynamic, setUserProfileDynamic] = useState(userProfile);
    const allowedPaths = ['/login', '/api'];

    useEffect(() => {
        async function fetchProfile() {
            if (session?.user?.email) {
                try {
                    const response = await fetch(`/api/users/${session.user.email}`);
                    const data = await response.json();
                    if (response.ok) {
                        setUserProfileDynamic(data);
                    } else {
                        console.error("Failed to fetch profile:", data);
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        }
        
        fetchProfile();
    }, [session]);

    useEffect(() => {
        if (session && !userProfile && !(allowedPaths.includes(pathname) || pathname === "/")) {
            signOut();
        }
    }, [session, userProfileDynamic, pathname]);
    

    return (
        <UserContext.Provider value={{ session, userProfile, userProfileDynamic }}>
            {children}
        </UserContext.Provider>
    )
}
