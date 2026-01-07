'use client'

import Link from "next/link"
import { Home, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MagicLinkSuccess() {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.push("/");
        }, 2000);

        return () => clearTimeout(timeout);
    }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center w-full">
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-9xl font-extrabold tracking-tight text-primary flex justify-center">
          <Mail className="h-32 w-32" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Magic Link Sent</h2>
          <p className="text-muted-foreground">Check your email for a link to sign in.</p>
          <p className="text-sm font-medium text-primary pt-4">
            <Link href="/" className="hover:underline">
              TravelFoodio
            </Link>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
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

