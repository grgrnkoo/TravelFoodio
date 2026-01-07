"use client"

import Link from "next/link"
import { Home, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthErrorMessage } from "@/components/AuthErrorMessage"
import { Suspense } from "react"

export default function AuthError() {

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
                        <AuthErrorMessage />
                    </Suspense>
                    <p className="text-sm font-medium text-primary pt-4">
                        <Link href="/" className="hover:underline">
                            TravelFoodio
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

