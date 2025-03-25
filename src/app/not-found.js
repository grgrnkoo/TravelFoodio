'use client'

import Link from "next/link"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center w-full">
      <div className="space-y-6 max-w-md mx-auto">
        <h1 className="text-9xl font-extrabold tracking-tight text-primary">404</h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
          <p className="text-muted-foreground">{`Sorry, we couldn't find the page you're looking for.`}</p>
        </div>

        <div className="pt-4">
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

