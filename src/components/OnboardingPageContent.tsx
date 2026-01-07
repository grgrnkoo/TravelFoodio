"use client"

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserContext } from "./UserProvider";
import OnboardingComponent from "./OnboardingComponent";
import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingPageContent() {
    const router = useRouter();
    const { user: clerkUser } = useUser();
    const { userProfileDynamic } = useContext(UserContext);
    const isLoading = userProfileDynamic === undefined;

    // Redirect if user has already completed onboarding
    useEffect(() => {
        if (!isLoading && userProfileDynamic?.onboarding2Completed) {
            router.push("/user");
        }
    }, [isLoading, userProfileDynamic?.onboarding2Completed, router]);

    // Show loading skeleton while checking user status
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center flex-grow w-full">
                <div className="flex flex-grow items-start justify-center p-4 w-full">
                    <div className="w-full max-w-lg">
                        <div className="mb-8 space-y-2">
                            <Skeleton className="h-8 w-3/4 mx-auto" />
                            <Skeleton className="h-4 w-1/2 mx-auto" />
                        </div>
                        <Skeleton className="h-[400px] w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    // Don't render content if redirecting
    if (userProfileDynamic?.onboarding2Completed) {
        return null;
    }

    const nameFromSession = clerkUser?.firstName || userProfileDynamic?.name?.split(' ')[0] || "";

    return (
        <div className="flex flex-col items-center justify-center flex-grow w-full">
            <div className="flex flex-grow items-start justify-center p-4 w-full">
                <div className="w-full max-w-lg">
                    <div className="mb-8">
                        <h1 className="text-center text-2xl font-bold text-slate-800">
                            Welcome to TravelFoodio{nameFromSession && `, ${nameFromSession}`}
                        </h1>
                        <p className="text-center text-slate-600">
                            Your personalized meals start here — let&apos;s dive in!
                        </p>
                    </div>
                    <OnboardingComponent firstStep={nameFromSession ? 1 : 0} nameFromSession={nameFromSession}/>
                </div>
            </div>
        </div>
    );
}

