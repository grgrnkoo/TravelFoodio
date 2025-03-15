"use client"

import Link from "next/link"
import { Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="space-y-6 max-w-md mx-auto">
        <h1 className="text-9xl font-extrabold tracking-tight text-primary">500</h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Server Error</h2>
          <p className="text-muted-foreground">Sorry, something went wrong on our end.</p>
          <p className="text-sm font-medium text-primary">FoodSm.art</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button onClick={() => reset()} variant="outline" size="lg" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild size="lg">
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

