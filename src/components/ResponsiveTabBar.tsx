"use client"

import { useState, useEffect, useContext } from "react"
import { ChevronDown, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import { UserContext } from "./UserProvider"

const today = new Date().toISOString().split('T')[0];

export function ResponsiveTabBar({ defaultTab = today, tabs, usedIn, onTabClick }: { defaultTab?: string; tabs: Array<{ id: string; label: string }>; usedIn: string; onTabClick?: (tab: { id: string; label: string }) => void }) {
    const [activeTab, setActiveTab] = useState(defaultTab)
    const [isMobile, setIsMobile] = useState(false)
    const router = useRouter();
    const pathname = usePathname();

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
    }, []);

    useEffect(() => {
        const currentTab = tabs.find(tab => pathname.includes(tab.id));
        if (currentTab) {
            setActiveTab(currentTab.id);
        }
    }, [pathname, tabs]);

    const onTabCLick = (tab: { id: string; label: string }) => {
        setActiveTab(tab.id);
        if (onTabClick) {
            onTabClick(tab);
        } else {
            router.push(`/user/${usedIn}/${tab.id}`)
        }
    }

    return (
        <div className="w-full flex justify-center items-center p-1.5 md:bg-muted/30 bg-transparent rounded-lg">
            {/* Desktop Tabs (md and up) - Vercel Style */}
            <Button variant="outline"
                size="icon"
                className="min-h-9 w-9 rounded-md"
                onClick={() => router.push(`/user`)}
            >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Go back</span>
            </Button>
            <div className="hidden md:flex w-full items-center">
                <div className="flex space-x-1 w-full justify-evenly">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabCLick(tab)}
                            className={cn(
                                "px-2 py-2 text-sm font-medium rounded-md transition-all",
                                activeTab === tab.id ? "bg-primary text-background shadow-sm" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
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