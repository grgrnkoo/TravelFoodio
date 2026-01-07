"use client";

import { useContext } from "react";
import { UserContext } from "./UserProvider";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PencilIcon, Home, Sparkles, History, Heart, ThumbsDown, Utensils, Globe, Clock, ImageIcon, Shield } from "lucide-react";
import BlankAvatarSvg from "@/ui/images/BlankAvatarSvg";
import { Button } from "./ui/button";

export default function SideMenu({ className }: { className: string }) {
    const { userProfile, userProfileDynamic } = useContext(UserContext);


    if (!userProfile) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="rounded-full bg-muted h-16 w-16" />
                    <div className="h-4 bg-muted rounded w-48" />
                    <div className="h-4 bg-muted rounded w-32" />
                </div>
            </div>
        );
    }

    return (
        <Card className={`mx-auto mb-8 shadow-lg max-w-[300px] border-0 overflow-hidden mt-4 ml-8 h-fit ${className}`}>
            <CardHeader className="relative pb-0 pt-6">
                <div className="absolute inset-0 h-24 bg-gradient-to-r from-primary/20 to-primary/40" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-2">
                        <div className="absolute inset-0 rounded-full bg-background/80 blur-sm -m-1" />
                        {
                            userProfileDynamic?.image ? (
                                <Image
                                    src={userProfileDynamic?.image}
                                    alt={`Profile picture`}
                                    width={100}
                                    height={100}
                                    priority
                                    className="rounded-full border-4 border-background relative z-10"
                                />) : (
                                <BlankAvatarSvg />
                            )
                        }
                    </div>
                    <Badge variant="outline" className="mb-2 font-semibold px-3 py-1">
                        {userProfile?.email}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6 space-y-2" key="CardContent">
                <SideMenuButton
                    icon={<Home className="h-4 w-4 text-muted-foreground" />}
                    label="Homepage"
                    href="/user"
                />
                <SideMenuButton
                    icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
                    label="Generate Menu"
                    href="/user/generate-menu"
                />
                <SideMenuButton
                    icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
                    label="Generate One Dish"
                    href="/user/generate-one-dish"
                />
                <SideMenuButton
                    icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />}
                    label="Inspect Photo with AI"
                    href="/user/inspect-photo"
                />
                <SideMenuButton
                    icon={<PencilIcon className="h-4 w-4 text-muted-foreground" />}
                    label="Edit Profile"
                    href="/user/editprofile"
                />
                <SideMenuButton
                    icon={<History className="h-4 w-4 text-muted-foreground" />}
                    label="History"
                    href="/user/history"
                />
                <SideMenuButton
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    label="Consumed Meals"
                    href="/user/consumed"
                />
                <SideMenuButton
                    icon={<Heart className="h-4 w-4 text-muted-foreground" />}
                    label="Favorite Meals"
                    href="/user/favorite-meals"
                />
                <SideMenuButton
                    icon={<ThumbsDown className="h-4 w-4 text-muted-foreground" />}
                    label="Disliked Meals"
                    href="/user/disliked-meals"
                />
                <SideMenuButton
                    icon={<Utensils className="h-4 w-4 text-muted-foreground" />}
                    label="Ingredients"
                    href="/user/ingredients"
                />
                <SideMenuButton
                    icon={<Globe className="h-4 w-4 text-muted-foreground" />}
                    label="Cuisines"
                    href="/user/cuisines"
                />
                {userProfileDynamic?.subscriptionType === 'admin' && (
                    <SideMenuButton
                        icon={<Shield className="h-4 w-4 text-muted-foreground" />}
                        label="Admin Panel"
                        href="/admin"
                    />
                )}
            </CardContent>
        </Card >
    );
}

function SideMenuButton({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
    return (
        <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href={href}>
                {icon}
                {label}
            </Link>
        </Button>
    );
}