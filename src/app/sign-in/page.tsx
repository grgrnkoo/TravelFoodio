'use client'

import { useSignIn, useUser } from "@clerk/nextjs"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, MailOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import MenuDishBackground from "@/components/MenuDishAnimation";
import { usePopup } from "@/components/providers/PopUpProvider";
import InAppBrowserBanner from "@/components/InAppBrowserBanner";

export default function SignInPage() {
    const { isSignedIn } = useUser();
    const { signIn } = useSignIn();
    const [formEmail, setFormEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [hover, setHover] = useState(false);
    const router = useRouter();
    const { showPopup } = usePopup();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateEmail = (email: string) => {
        const isValid = emailRegex.test(email);
        setIsEmailValid(isValid);
        return isValid;
    };

    useEffect(() => {
        if (isSignedIn) {
            router.push(`/user`);
        }
    }, [isSignedIn, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const email = e.target.value;
        setFormEmail(email);
        setIsEmailValid(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validateEmail(formEmail)) {
            showPopup("Invalid email format. Please enter a valid email.", "error");
            console.error("Invalid email format. Please enter a valid email.");
            setIsLoading(false);
            return;
        }

        if (!signIn) {
            showPopup("Sign in not available", "error");
            setIsLoading(false);
            return;
        }

        try {
            // Create sign in with email code strategy (OTP)
            const result = await signIn.create({
                identifier: formEmail,
            });
            
            // Check if email_code strategy is available
            const emailCodeFactor = result.supportedFirstFactors?.find(
                (ff) => ff.strategy === "email_code" && "emailAddressId" in ff
            );

            if (!emailCodeFactor) {
                // Fallback to email_link if available
                const emailLinkFactor = result.supportedFirstFactors?.find(
                    (ff) => ff.strategy === "email_link" && "emailAddressId" in ff
                );
                
                if (emailLinkFactor && "emailAddressId" in emailLinkFactor) {
                    await result.prepareFirstFactor({
                        strategy: "email_link",
                        emailAddressId: emailLinkFactor.emailAddressId,
                        redirectUrl: `${window.location.origin}/user`,
                    });
                    showPopup("Magic link sent! Please check your email.", "success");
                    return;
                }
                
                throw new Error("No supported email authentication strategy found");
            }
            
            // Send the email code (OTP)
            if ("emailAddressId" in emailCodeFactor) {
                await result.prepareFirstFactor({
                    strategy: "email_code",
                    emailAddressId: emailCodeFactor.emailAddressId,
                });
                
                // Redirect to verification page with email
                router.push(`/auth/verify-email?email=${encodeURIComponent(formEmail)}`);
            }
        } catch (error: unknown) {
            console.error("Error sending authentication email:", error);
            const clerkError = error as { errors?: { message: string }[] };
            showPopup(clerkError?.errors?.[0]?.message || "Failed to send authentication email. Please try again later.", "error");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!signIn) {
            showPopup("Sign in not available", "error");
            return;
        }
        
        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: `${window.location.origin}/sso-callback`,
                redirectUrlComplete: `${window.location.origin}/user`,
            });
        } catch (error: unknown) {
            console.error("Error with Google sign in:", error);
            const clerkError = error as { errors?: { message: string }[] };
            showPopup(clerkError?.errors?.[0]?.message || "Failed to sign in with Google. Please try again.", "error");
        }
    }

    return (
        !isSignedIn && (
            <div className="relative flex min-h-screen flex-row w-full">
                <InAppBrowserBanner className="fixed w-full h-fit bottom-0" />
                <div className="flex w-full items-center justify-center p-4 md:p-8 relative">
                    <Card className="mx-auto w-full max-w-sm z-10">
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
                                        type="email"
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
                                            {hover ? <MailOpen className="pb-px mr-2 mt-[2px]" /> : <Mail className="mr-2 mt-[2px]" />} Sign in with Email
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link href="/sign-up" className="underline underline-offset-4 hover:text-primary font-medium">
                                    Sign up
                                </Link>
                            </p>
                            <p className="text-xs text-center text-muted-foreground">
                                By signing in, you agree to our{" "}
                                <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                                    Privacy Policy
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                    <div className="flex h-full -z-1 absolute">
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

