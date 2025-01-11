'use client'

import { signIn, useSession } from "next-auth/react"
import React from "react";

export default function Login() {
    const { data: session } = useSession();
    console.log(session);

    return <>
        <button onClick={() => signIn('google')}>Sign in with Google</button>
    </>
}