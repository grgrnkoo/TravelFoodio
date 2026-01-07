"use client";

import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Users, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function AdminNav() {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: AlertTriangle, label: "Errors", path: "/admin/errors" },
        { icon: BarChart3, label: "Statistics", path: "/admin/stats" },
    ];

    return (
        <nav className="w-64 min-h-screen bg-card border-r p-4">
            <h2 className="text-2xl font-bold mb-6 px-2">Admin Panel</h2>
            <div className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                    return (
                        <Button
                            key={item.path}
                            variant={isActive ? "default" : "ghost"}
                            className={cn(
                                "w-full justify-start",
                                isActive && "bg-primary text-primary-foreground"
                            )}
                            onClick={() => router.push(item.path)}
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            {item.label}
                        </Button>
                    );
                })}
            </div>
        </nav>
    );
}

