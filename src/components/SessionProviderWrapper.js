'use client'

import { SessionProvider } from "next-auth/react";

export default function SessionProviderWrapper({ children }) {
    // Session provider. Children of this wrapper have 
    // an access to a current login session.
    return <SessionProvider>{children}</SessionProvider>
}