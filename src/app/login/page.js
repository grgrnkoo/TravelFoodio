'use client'

import { signIn, useSession } from "next-auth/react"
import React, { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import LoginWithEmail from "../../components/LoginWithEmail";
import { GoogleAuthButton } from "@/components/GoogleButton/GoogleAuthButton";

export default function Login() {
    // Login page
    const { data: session, status } = useSession();
    const [data, setData] = useState({});
    const [formEmail, setFormEmail] = useState('');
    const searchParams = useSearchParams();

    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    useEffect(() => {
        if (status === "authenticated") {
            axios.get(`/api/users/${session.user?.email}`)
                .then(response => setData(response.data))
                .catch(error => console.error('Error fetching user data:', error));
            redirect('/dashboard');
        }
    }, [status]);

    // if (data.age === 0 || data.weight === 0 || data.goals === '' || data.additionalInfo === '') {
    //     // Redirect to onboarding if user exists but didn't fill 
    //     // any of onboarding data
    //     router.push('/onboarding');
    // } else if (data.age > 0 && data.weight > 0 && data.goals.length > 0 && data.additionalInfo.length > 0) {
    //     //Redirect to a dashboard if user exists and completed onboarding
    //     router.push('/dashboard');
    // }


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
            const result = await signIn('resend', { email: formEmail, callbackUrl });
            console.log('Magic link result: ', result)
            alert("Magic link sent! Please check your email.");
        } catch (error) {
            console.error("Error sending Magic Link:", error);
            alert("Failed to send magic link. Please try again later.");
        }
    }

    function handleClick(e) {
        e.preventDefault();
        signIn('google');
    }

    return (
        status === 'unauthenticated' && (
            <div className="flex flex-col">
                <GoogleAuthButton onClick={handleClick} />
                <form
                    className="flex flex-col mt-4"
                    onSubmit={handleSubmit}
                >
                    <input
                        type='email'
                        name='magic-email'
                        id='magic-email'
                        className="border-r-2 border-2 rounded-md mb-4"
                        onChange={handleChange}
                        value={formEmail}
                    />
                    <LoginWithEmail type='submit' />
                </form>
            </div>
        )
    )
}