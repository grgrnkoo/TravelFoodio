'use client'

import { signIn, useSession } from "next-auth/react"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Mail, MailOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import LoginWithEmail from "@/components/LoginWithEmail";
import MenuDishBackground from "@/components/MenuDishAnimation";
import { usePopup } from "@/components/providers/PopUpProvider";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const [formEmail, setFormEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [hover, setHover] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showPopup } = usePopup();

    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex);
        return emailRegex.test(email);
    };

    useEffect(() => {
        if (status === "authenticated" && session?.user?.username) {
            router.push(`/${session.user.username}`);
        }
    }, [status, session]);

    console.log(session);

    const handleChange = (e) => {
        e.preventDefault();
        const email = e.target.value;
        setFormEmail(email);
        setIsEmailValid(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validateEmail(formEmail)) {
            console.log("Invalid email:", formEmail);
            showPopup("Invalid email format. Please enter a valid email.", "error");
            console.log("Invalid email format. Please enter a valid email.");
            setIsLoading(false);
            return;
        }

        try {
            // Call NextAuth's email provider
            if (!validateEmail(formEmail)) {
                throw new Error("Invalid email format");
            }
            const result = await signIn('resend', { email: formEmail, callbackUrl });
            console.log('Magic link result: ', result)
            showPopup("Magic link sent! Please check your email.", "success");
        } catch (error) {
            console.error("Error sending Magic Link:", error);
            showPopup("Failed to send magic link. Please try again later.", "error");
        } finally {
            setIsLoading(false);
        }
    }

    function handleClick(e) {
        e.preventDefault();
        signIn('google');
    }

    return (
        status === 'unauthenticated' && (
            <div className="flex min-h-screen flex-row">
                <div className="flex w-full items-center justify-center p-4 md:p-8">
                    <Card className="mx-auto w-full max-w-md">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                            <CardDescription>Choose your preferred sign in method</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full" onClick={handleClick}>
                                <svg
                                    className="mr-2 h-4 w-4"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fab"
                                    data-icon="google"
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 488 512"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                    ></path>
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        placeholder="m@example.com"
                                        onChange={handleChange}
                                        value={formEmail}
                                    />
                                    {!isEmailValid && <p className="text-red-500 text-xs">Invalid email format</p>}
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                    onMouseOver={() => setHover(true)}
                                    onMouseLeave={() => setHover(false)}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="mr-2 h-4 w-4 animate-spin"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : (
                                        <span className="flex justify-center align-middle w-full">
                                            {hover ? <MailOpen className="pb-px" /> : <Mail className="" />} Login with Email
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            {/* <p className="text-sm text-muted-foreground">
                                By signing in, you agree to our{" "}
                                <a href="#" className="underline underline-offset-4 hover:text-primary">
                                Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="#" className="underline underline-offset-4 hover:text-primary">
                                Privacy Policy
                                </a>
                                </p> */}
                        </CardFooter>
                    </Card>
                    <div>
                        <AnimatedBackground />
                    </div>
                </div>
            </div>
        )
    )
}

function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden -z-10">
            <MenuDishBackground />
        </div>
    )
}

