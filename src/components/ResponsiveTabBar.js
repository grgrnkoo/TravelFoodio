"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"

const today = new Date().toISOString().split('T')[0];

export function ResponsiveTabBar({ defaultTab = today, tabs, username, usedIn }) {
    const [activeTab, setActiveTab] = useState(defaultTab)
    const [isMobile, setIsMobile] = useState(false)
    const router = useRouter();

    // Check if we're on mobile screen size
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768) // md breakpoint
        }

        // Initial check
        checkIfMobile()

        // Add event listener
        window.addEventListener("resize", checkIfMobile)

        // Cleanup
        return () => window.removeEventListener("resize", checkIfMobile)
    }, [])

    const onTabCLick = (tab) => {
        setActiveTab(tab.id);
        router.push(`/${username}/${usedIn}/${tab.id}`)
    }

    return (
        <div className="w-full">
            {/* Desktop Tabs (md and up) - Vercel Style */}
            <div className="hidden md:flex w-full justify-evenly p-1.5 bg-muted/30 rounded-lg">
                <div className="flex space-x-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabCLick(tab)}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                "hover:bg-muted/70",
                                activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Dropdown (below md) */}
            <div className="md:hidden w-full p-1.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between font-medium">
                            {tabs.find((tab) => tab.id === activeTab)?.label}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        {tabs.map((tab) => (
                            <DropdownMenuItem
                                key={tab.id}
                                onClick={() => onTabCLick(tab)}
                                className={cn("cursor-pointer", activeTab === tab.id && "bg-muted font-medium")}
                            >
                                {tab.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}