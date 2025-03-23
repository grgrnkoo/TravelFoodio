"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { useContext, useState, useEffect } from "react"
import { UserContext } from "@/components/UserProvider"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { CardHeader } from "./ui/card"
import { Badge } from "./ui/badge"
import Image from "next/image"
import BlankAvatarSvg from "@/ui/images/BlankAvatarSvg"

export default function Header({ session }) {
    const params = useParams()
    const { userProfile = null } = useContext(UserContext)
    const [isOpen, setIsOpen] = useState(false)
    const [scrollDirection, setScrollDirection] = useState("up")
    const [lastScrollY, setLastScrollY] = useState(0)
    const [isAtTop, setIsAtTop] = useState(true)

    // Handle scroll direction detection
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Determine if we're at the top of the page
            setIsAtTop(currentScrollY < 10)

            // Determine scroll direction
            if (currentScrollY > lastScrollY + 10) {
                setScrollDirection("down")
            } else if (currentScrollY < lastScrollY - 10) {
                setScrollDirection("up")
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [lastScrollY])

    const handleSignOut = () => {
        signOut({ callbackUrl: "/" })
    }

    return (
        <header
            className={cn(
                "fixed flex items-center px-4 sm:px-6 py-3 z-50 justify-between w-full transition-all duration-300",
                "left-0 right-0 mx-auto max-w-7xl",
                isAtTop ? "top-4" : scrollDirection === "up" ? "top-2" : "-top-24",
                isAtTop ? "bg-transparent" : "bg-white/90 backdrop-blur-md shadow-md sm:rounded-full",
            )}
        >
            {/* Logo */}
            <div className="pl-2">
                <Link
                    href={userProfile ? `/${userProfile.username}` : "/"}
                    className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                >
                    FoodSm.art
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-4 items-center pr-2">
                <Link href={`/feedback${userProfile ? `?sender=${userProfile.username}` : ""}`}>
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                        Send Feedback
                    </Button>
                </Link>
                {!session ? (
                    <Link href="/login">
                        <Button size="sm" className="hover:opacity-90 cursor-pointer">
                            Sign In
                        </Button>
                    </Link>
                ) : (
                    <>
                        {userProfile && !params.username && (
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        )}
                        <Button
                            onClick={handleSignOut}
                            variant="outline"
                            size="sm"
                            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer"
                        >
                            Sign Out
                        </Button>
                    </>
                )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex cursor-pointer p-2" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mx-8 bg-white/95 backdrop-blur-md shadow-lg overflow-hidden rounded-xl flex flex-col gap-4 md:hidden border border-border/40">
                    {session && (
                        <CardHeader className="relative pb-0 pt-6">
                            <div className="absolute inset-0 h-24 bg-gradient-to-r from-primary/20 to-primary/40" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="relative mb-2">
                                    <div className="absolute inset-0 rounded-full bg-background/80 blur-sm -m-1" />
                                    {
                                        userProfile?.image ? <Image
                                            src={userProfile?.image}
                                            alt={`${userProfile?.username} profile picture`}
                                            width={100}
                                            height={100}
                                            priority
                                            className="rounded-full border-4 border-background relative z-10"
                                        /> :
                                            <BlankAvatarSvg />
                                    }
                                </div>
                                <Badge variant="outline" className="mb-2 font-semibold px-3 py-1">
                                    {userProfile?.username}
                                </Badge>
                            </div>
                        </CardHeader>
                    )}
                    <div className="p-4 flex flex-col">
                        <Link
                            href={`/feedback${userProfile ? `?sender=${userProfile.username}` : ""}`}
                            className="px-2 py-3 hover:bg-primary/10 rounded-md transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Send Feedback
                        </Link>
                        {!session ? (
                            <>
                                <Link
                                    href="#keyAdvantages"
                                    className="px-2 py-3 hover:bg-primary/10 rounded-md transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Why Choose FoodSm.art?
                                </Link>
                                <Link
                                    href="#howItWorks"
                                    className="px-2 py-3 hover:bg-primary/10 rounded-md transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    How It Works
                                </Link>
                                <Link
                                    href="#plans"
                                    className="px-2 py-3 hover:bg-primary/10 rounded-md transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Pricing
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-2 py-3 mt-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary/20 transition-colors text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign In
                                </Link>
                            </>
                        ) : (
                            <>
                                {userProfile && (
                                    <Link
                                        href={`/${userProfile?.username}/editprofile`}
                                        className="px-2 py-3 hover:bg-primary/10 rounded-md transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Edit Profile
                                    </Link>
                                )}
                                {userProfile && (
                                    <Link
                                        href="/dashboard"
                                        className="px-2 py-3 hover:bg-primary/10 rounded-md transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        handleSignOut()
                                    }}
                                    className="px-2 py-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left"
                                >
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

