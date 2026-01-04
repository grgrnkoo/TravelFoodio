import OnboardingSummary from "@/components/OnboardingSummary";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "../../../../../_lib/actions";

export const metadata = {
    title: "Onboarding Completed | FoodSmart AI",
};

export default async function OnboardingCompletedPage() {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        return redirect("/login?error=missing-user");
    }

    const userProfile = await getUserByClerkId(clerkUserId);

    if (!userProfile) {
        return redirect("/login?error=sign-out");
    }

    // If user has completed onboarding, redirect to dashboard
    if (userProfile?.onboardingCompleted) {
        return redirect("/user");
    }

    // Create a user object for the OnboardingSummary component
    const userFromSession = {
        id: userProfile._id?.toString(),
        email: userProfile.email,
        name: userProfile.name,
    };

    return (
        <div className="flex flex-col items-center justify-center flex-grow w-full">
            <div className="flex flex-col flex-grow items-center justify-start p-4 w-full">
                <h1 className="text-center text-2xl font-bold text-slate-800">Hooooray! Onboarding Completed</h1>
                <div className="mb-8">
                    <p className="text-center text-slate-600">Here is the information you provided:</p>
                </div>
                <OnboardingSummary userFromSession={userFromSession} />
            </div>
        </div>
    );
}
