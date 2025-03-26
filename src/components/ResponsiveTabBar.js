"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
  { id: "profile", label: "Profile" },
]

export function ResponsiveTabBar({ defaultTab = "dashboard" }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isMobile, setIsMobile] = useState(false)

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

  return (
    <div className="w-full">
      {/* Desktop Tabs (md and up) - Vercel Style */}
      <div className="hidden md:flex w-full p-1.5 bg-muted/30 rounded-lg">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
                onClick={() => setActiveTab(tab.id)}
                className={cn("cursor-pointer", activeTab === tab.id && "bg-muted font-medium")}
              >
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "analytics" && <AnalyticsContent />}
        {activeTab === "reports" && <ReportsContent />}
        {activeTab === "settings" && <SettingsContent />}
        {activeTab === "profile" && <ProfileContent />}
      </div>
    </div>
  )
}

// Sample content components
function DashboardContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-6 rounded-xl border">
          <h3 className="font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold">12,345</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 rounded-xl border">
          <h3 className="font-medium mb-2">Revenue</h3>
          <p className="text-3xl font-bold">$34,567</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 rounded-xl border">
          <h3 className="font-medium mb-2">Conversion</h3>
          <p className="text-3xl font-bold">23.5%</p>
        </div>
      </div>
    </div>
  )
}

function AnalyticsContent() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <div className="h-64 bg-muted/50 rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">Analytics charts would go here</p>
      </div>
    </div>
  )
}

function ReportsContent() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-medium">Q1 Performance Report</h3>
            <p className="text-sm text-muted-foreground">Last updated: 3 days ago</p>
          </div>
          <Button size="sm">Download</Button>
        </div>
        <div className="p-4 border rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-medium">Annual Financial Summary</h3>
            <p className="text-sm text-muted-foreground">Last updated: 1 week ago</p>
          </div>
          <Button size="sm">Download</Button>
        </div>
      </div>
    </div>
  )
}

function SettingsContent() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Account Settings</h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <span>Email Notifications</span>
              <div className="h-5 w-10 bg-muted rounded-full"></div>
            </div>
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <span>Two-Factor Authentication</span>
              <div className="h-5 w-10 bg-muted rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Privacy</h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <span>Data Sharing</span>
              <div className="h-5 w-10 bg-muted rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileContent() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="h-24 w-24 rounded-full bg-muted"></div>
        </div>
        <div className="space-y-4 flex-1">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <input type="text" className="border rounded-md p-2" defaultValue="Alex Johnson" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <input type="email" className="border rounded-md p-2" defaultValue="alex@example.com" />
          </div>
          <div className="pt-2">
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

