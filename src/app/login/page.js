'use client'

import { signIn, useSession } from "next-auth/react"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Login() {
    // Login page
    const { data: session, status } = useSession();
    const [data, setData] = useState({});
    const [formEmail, setFormEmail] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            axios.get(`/api/users/${session.user?.email}`)
                .then(response => setData(response.data))
                .catch(error => console.error('Error fetching user data:', error));
        }
    }, [status]);

    if (data.age === 0 || data.weight === 0 || data.goals === '' || data.additionalInfo === '') {
        // Redirect to onboarding if user exists but didn't fill 
        // any of onboarding data
        router.push('/onboarding');
    } else if (data.age > 0 && data.weight > 0 && data.goals.length > 0 && data.additionalInfo.length > 0) {
        //Redirect to a dashboard if user exists and completed onboarding
        router.push('/dashboard');
    }
    console.log(data);
    console.log(session);

    const handleChange = (e) => {
        e.preventDefault();
        setFormEmail(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Call NextAuth's email provider
            await signIn("resend", { email: formEmail });
            alert("Magic link sent! Please check your email.");
          } catch (error) {
            console.error("Error sending Magic Link:", error);
            alert("Failed to send magic link. Please try again later.");
          }
    }

    return <>
        <button onClick={() => signIn('google')}>Sign in with Google</button>
        <form 
            className="flex flex-col mt-4"
            onSubmit={handleSubmit}
        >
            <input
                type='email'
                name='magic-email'
                id='magic-email'
                className="border-r-2 border-2"
                onChange={handleChange}
                value={formEmail}
            />
            <button type='submit'>Send auth link</button>
        </form>
    </>
}