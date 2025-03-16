"use client"

import React, { createContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export const UserContext = createContext({})

export default function UserProvider({ value, children }) {
    const { session: serverSession, userProfile } = value;
    const { data: clientSession } = useSession();
    const [userProfileDynamic, setUserProfileDynamic] = useState(userProfile);
    // const allowedPaths = ['/login', '/api'];
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const session = clientSession || serverSession;

    useEffect(() => {
        if (!session?.user?.email || userProfileDynamic) return;
        console.log('db fetch triggered. useeffect: ', session, userProfile)
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
                } finally {
                    setIsProfileLoading(false);
                }
            } else {
                setIsProfileLoading(false);
            }
        }
        
        fetchProfile();
    }, [session, userProfileDynamic]);    

    return (
        <UserContext.Provider value={{ session, userProfile, userProfileDynamic }}>
            {children}
        </UserContext.Provider>
    )
}
