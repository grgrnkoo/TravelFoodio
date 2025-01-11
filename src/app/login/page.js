'use client'

import { signIn, useSession } from "next-auth/react"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Login() {
    const { data: session, status } = useSession();
    const [data, setData] = useState({});
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            axios.get(`/api/users/${session.user?.email}`)
                .then(response => setData(response.data))
                .catch(error => console.error('Error fetching user data:', error));
        }
    }, [status]);

    if (data.age === 0 || data.weight === 0 || data.goals === '' || data.additionalInfo === '') {
        router.push('/onboarding');
    } else if (data.age > 0 && data.weight > 0 && data.goals.length > 0 && data.additionalInfo.length > 0) {
        router.push('/dashboard');
    }
    console.log(data);
    console.log(session);

    return <>
        <button onClick={() => signIn('google')}>Sign in with Google</button>
    </>
}