"use client"

import React, { createContext } from "react";

export const UserContext = createContext({})

export default function UserProvider({ value, children }) {
    const {session, userProfile} = value;

    return (
        <UserContext.Provider value ={{session, userProfile}}>
            {children}
        </UserContext.Provider>
    )
}
