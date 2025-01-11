'use client'

import { signIn, useSession } from "next-auth/react"
import React from "react";

export default function Login() {
    const { data: session } = useSession();

    return <>
        <button onClick={() => signIn('google')}>Sign in with Google</button>
    </>
}