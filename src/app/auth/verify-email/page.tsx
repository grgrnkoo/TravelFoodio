'use client'

import { useSignIn, useUser } from "@clerk/nextjs"
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { usePopup } from "@/components/providers/PopUpProvider";
import { ArrowLeft, Mail } from "lucide-react";

export default function VerifyEmailPage() {
    const { isSignedIn } = useUser();
    const { signIn, setActive } = useSignIn();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const { showPopup } = usePopup();

    useEffect(() => {
        if (isSignedIn) {
            router.push(`/user`);
        }
    }, [isSignedIn, router]);

    useEffect(() => {
        if (!email) {
            router.push('/login');
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (!signIn) {
            showPopup("Sign in not available", "error");
            setIsLoading(false);
            return;
        }

        if (!code || code.length < 6) {
            showPopup("Please enter a valid 6-digit code", "error");
            setIsLoading(false);
            return;
        }

        try {
            // Attempt to verify the email code
            const result = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code: code,
            });

            if (result.status === "complete") {
                // Set the active session
                if (setActive) {
                    await setActive({ session: result.createdSessionId });
                }
                
                showPopup("Successfully signed in!", "success");
                
                // Check if user needs onboarding
                router.push('/user');
            } else {
                // Handle other statuses if needed
                showPopup("Verification incomplete. Please try again.", "error");
            }
        } catch (error: any) {
            console.error("Error verifying code:", error);
            showPopup(error?.errors?.[0]?.message || "Invalid code. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!signIn) {
            showPopup("Sign in not available", "error");
            return;
        }

        if (!email) {
            showPopup("Email not found. Please return to login.", "error");
            return;
        }

        try {
            setIsLoading(true);
            
            // Create a new sign in
            const result = await signIn.create({
                identifier: email,
            });
            
            const emailCodeFactor = result.supportedFirstFactors?.find(
                (ff) => ff.strategy === "email_code" && "emailAddressId" in ff
            );

            if (emailCodeFactor && "emailAddressId" in emailCodeFactor) {
                await result.prepareFirstFactor({
                    strategy: "email_code",
                    emailAddressId: emailCodeFactor.emailAddressId,
                });
                
                showPopup("New code sent! Please check your email.", "success");
            }
        } catch (error: any) {
            console.error("Error resending code:", error);
            showPopup(error?.errors?.[0]?.message || "Failed to resend code. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        !isSignedIn && (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="mx-auto w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/login')}
                                className="h-8 w-8"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                        </div>
                        <CardDescription className="flex items-start gap-2">
                            <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                                We've sent a 6-digit verification code to{" "}
                                <span className="font-semibold text-foreground">{email}</span>
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest"
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || code.length < 6}
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
                                        Verifying...
                                    </span>
                                ) : (
                                    "Verify Email"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <div className="text-sm text-center text-muted-foreground">
                            Didn't receive the code?{" "}
                            <Button
                                variant="link"
                                className="p-0 h-auto font-semibold"
                                onClick={handleResendCode}
                                disabled={isLoading}
                            >
                                Resend code
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        )
    );
}

