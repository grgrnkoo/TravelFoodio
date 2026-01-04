import OnboardingComponent from "@/components/OnboardingComponent";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "../../../../_lib/actions";

export const metadata = {
    title: "Onboarding | FoodSmart AI",
};

export default async function OnboardingPage() {
    const { userId } = await auth();
    
    if (!userId) {
        return redirect("/login?error=sign-out");
    }

    const clerkUser = await currentUser();
    const userProfile = await getUserByClerkId(userId);

    // If user has completed onboarding, redirect to dashboard
    if (userProfile?.onboardingCompleted) {
        return redirect("/user");
    }

    const nameFromSession = clerkUser?.firstName || userProfile?.name?.split(' ')[0] || "";

    return (
        <div className="flex flex-col items-center justify-center flex-grow">
            <div className="flex flex-grow items-start justify-center p-4 w-full">
                <div className="w-full max-w-lg">
                    <div className="mb-8">
                        <h1 className="text-center text-2xl font-bold text-slate-800">Welcome to FoodSmart AI{nameFromSession && `, ${nameFromSession}`}</h1>
                        <p className="text-center text-slate-600">Your personalized meals start here — let's dive in!</p>
                    </div>
                    <OnboardingComponent />
                </div>
            </div>
        </div>
    );
}
