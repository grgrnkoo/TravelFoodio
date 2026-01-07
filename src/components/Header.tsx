"use client"

import Link from "next/link"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { DropdownBackdrop } from "@/components/DropdownBackdrop"
import { Command, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { useScrollLock } from "@/app/hooks/useScrollLock"
import { useUser, useClerk } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

interface HeaderProps {
    initialIsSignedIn?: boolean;
}

export default function Header({ initialIsSignedIn = false }: HeaderProps) {
    const { isSignedIn: clientIsSignedIn, user, isLoaded } = useUser()
    const { signOut } = useClerk()

    // Use server boolean initially, then client data once loaded
    const isSignedIn = isLoaded ? clientIsSignedIn : initialIsSignedIn
    const pathname = usePathname()

    // Hide auth buttons on sign-in/sign-up pages
    const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up"
    const isOnboardingPage = pathname === "/user/onboarding"

    const [isOpen, setIsOpen] = useState(false)
    const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up")
    const [lastScrollY, setLastScrollY] = useState(0)
    const [isAtTop, setIsAtTop] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        },
        [],
    )

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setIsOpen(false)
        }
    }, [])

    useScrollLock(isOpen)

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleKeyDown])

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            setIsAtTop(currentScrollY < 10)

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

    useEffect(() => {
        if (!isOpen) return

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen, handleClickOutside])

    const handleSignOut = () => {
        signOut({ redirectUrl: "/" })
    }

    const closeMenuAndNavigate = (href: string) => {
        setIsOpen(false)
        window.location.href = href
    }

    const username = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User"

    return (
        <header
            className={cn(
                "fixed flex items-center px-4 sm:px-6 pb-2 pt-6 z-30 justify-between w-full transition-all duration-300",
                "left-0 right-0 mx-auto max-w-7xl",
                isAtTop ? "top-0" : scrollDirection === "up" ? "top-[-12px]" : "-top-24",
                isAtTop ? "bg-gradient-to-b from-white/100 to-transparent" : "bg-white/90 shadow-sm rounded-b-xl sm:rounded-sm",
            )}
        >
            {/* Logo */}
            <div className="pl-2">
                <Link
                    href="/"
                    className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                >
                    TravelFoodio
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-4 items-center pr-2 transition-all duration-300">
                <Link href="/feedback">
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 cursor-pointer">
                        Send feedback
                    </Button>
                </Link>

                {!isSignedIn && !isAuthPage ? (
                    <>
                        <Link href="/sign-in">
                            <Button size="sm" className="hover:opacity-90 cursor-pointer" variant="secondary">
                                Sign in
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button size="sm" className="hover:opacity-90 cursor-pointer">
                                Get Started
                            </Button>
                        </Link>
                    </>
                ) : isSignedIn ? (
                    <>
                        {!isOnboardingPage && (
                            <>
                                <Link href="/user">
                                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 cursor-pointer">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link href="/user/history">
                                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 cursor-pointer">
                                        History
                                    </Button>
                                </Link>
                            </>
                        )}
                        <Button
                            onClick={handleSignOut}
                            variant="outline"
                            size="sm"
                            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer"
                        >
                            Sign out
                        </Button>
                    </>
                ) : null}
            </nav>

            {/* Mobile Menu Button */}
            <button
                type="button"
                className="md:hidden z-70 flex cursor-pointer p-2"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Dropdown Menu */}
            <div
                ref={dropdownRef}
                className={cn(
                    "absolute z-70 top-full left-0 right-0 mx-4 overflow-hidden rounded-xl flex flex-col md:hidden transition-all duration-300 ease-out origin-top transform",
                    isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
                )}
            >
                <Command className="rounded-lg border shadow-md">
                    {isSignedIn && (
                        <div className="flex items-center p-4 pb-0">
                            <div className="flex items-center gap-2">
                                <div className="relative h-10 w-10">
                                    <div className="absolute inset-0 rounded-full bg-primary/20" />
                                    <div className="relative z-10 h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center text-sm font-medium">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <Badge variant="outline" className="font-semibold px-3 py-1">
                                    {username}
                                </Badge>
                            </div>
                        </div>
                    )}
                    <CommandList className="min-h-fit">
                        <CommandGroup>
                            <CommandItem
                                className="hover:bg-transparent! focus:bg-transparent! p-4 text-lg rounded-none"
                                onSelect={() => closeMenuAndNavigate("/feedback")}
                            >
                                <span className="text-slate-700">Send feedback</span>
                            </CommandItem>

                            {!isSignedIn && !isAuthPage ? (
                                <>
                                    <CommandItem
                                        className="hover:bg-transparent! focus:bg-transparent! p-4 text-lg rounded-none"
                                        onSelect={() => closeMenuAndNavigate("#keyAdvantages")}
                                    >
                                        <span className="text-slate-700">Why TravelFoodio?</span>
                                    </CommandItem>
                                    <CommandItem
                                        className="hover:bg-transparent! focus:bg-transparent! p-4 text-lg rounded-none"
                                        onSelect={() => closeMenuAndNavigate("#howItWorks")}
                                    >
                                        <span className="text-slate-700">How it works?</span>
                                    </CommandItem>
                                    <CommandSeparator className="my-2" />
                                    <CommandItem
                                        className="hover:bg-transparent! focus:bg-transparent! pt-2 px-4 pb-5 text-lg rounded-none"
                                        onSelect={() => closeMenuAndNavigate("/sign-in")}
                                    >
                                        <span className="font-semibold">Sign in</span>
                                    </CommandItem>
                                </>
                            ) : isSignedIn ? (
                                <>
                                    <CommandItem
                                        className="hover:bg-transparent! focus:bg-transparent! p-4 text-lg rounded-none"
                                        onSelect={() => closeMenuAndNavigate("/user")}
                                    >
                                        <span className="text-slate-700">Dashboard</span>
                                    </CommandItem>
                                    <CommandItem
                                        className="hover:bg-transparent! focus:bg-transparent! p-4 text-lg rounded-none"
                                        onSelect={() => closeMenuAndNavigate("/user/history")}
                                    >
                                        <span className="text-slate-700">History</span>
                                    </CommandItem>
                                    <CommandSeparator className="my-2" />
                                    <CommandItem
                                        className="hover:bg-transparent! focus:bg-transparent! pt-2 px-4 pb-5 text-lg rounded-none"
                                        onSelect={() => {
                                            setIsOpen(false)
                                            handleSignOut()
                                        }}
                                    >
                                        <span className="font-semibold text-destructive">Sign out</span>
                                    </CommandItem>
                                </>
                            ) : null}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </div>
            <DropdownBackdrop isVisible={isOpen} className="md:hidden" />
        </header>
    )
}
