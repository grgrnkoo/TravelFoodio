"use client"

import Link from "next/link"
import { Home, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Suspense } from "react"

export default function AuthError() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    const [errorMessage, setErrorMessage] = useState("An authentication error occurred")

    useEffect(() => {
        // Map error codes to user-friendly messages
        const errorMessages = {
            Configuration: "There is a problem with the server configuration.",
            AccessDenied: "You do not have permission to sign in.",
            Verification: "The verification link may have been used or has expired.",
            OAuthSignin: "Error in the OAuth sign-in process.",
            OAuthCallback: "Error in the OAuth callback process.",
            OAuthCreateAccount: "Could not create OAuth provider account.",
            EmailCreateAccount: "Could not create email provider account.",
            Callback: "Error in the OAuth callback.",
            OAuthAccountNotLinked: "This email is already associated with another account.",
            EmailSignin: "Error sending the email verification link.",
            CredentialsSignin: "The credentials you provided were invalid.",
            SessionRequired: "You must be signed in to access this page.",
            Default: "An authentication error occurred.",
        }

        setErrorMessage(errorMessages[error] || errorMessages["Default"])
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center w-full">
            <div className="space-y-6 max-w-md mx-auto">
                <div className="flex justify-center">
                    <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Authentication Error</h2>
                    <Suspense fallback={<p className="text-muted-foreground">Loading error...</p>}>
                        <p className="text-muted-foreground">{errorMessage}</p>
                    </Suspense>
                    <p className="text-sm font-medium text-primary pt-4">
                        <Link href="/" className="hover:underline">
                            FoodSm.art
                        </Link>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button asChild size="lg">
                        <Link href="/signin" className="flex items-center gap-2">
                            Sign In Again
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

