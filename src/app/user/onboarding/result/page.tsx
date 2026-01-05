import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserExists } from "../../../../../_lib/supabase/queries/users";
import { fetchPreferences } from "../../../../../_lib/onboardingFunctions";
import OnboardingResultClient from "@/components/OnboardingResultClient";

export const metadata = {
    title: "Onboarding Results | FoodSmart AI",
};

export default async function OnboardingResult() {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        redirect("/sign-in?error=sign-out");
    }

    const userProfile = await ensureUserExists(clerkUserId);

    if (!userProfile) {
        redirect("/sign-in?error=sign-out");
    }

    // If user has completed onboarding, redirect to dashboard
    if (userProfile?.onboardingCompleted) {
        return redirect("/user");
    }

    // Get the user ID for fetching preferences
    const userId = userProfile.id;

    if (!userId) {
        return redirect("/user/onboarding");
    }

    const fetchedUserPreferences = await fetchPreferences(userId);
    if (fetchedUserPreferences.status !== 200) {
        return (
            <div className="flex flex-col w-full">
                <h2>
                    Failed to generate AI summary
                </h2>
                <p>
                    Reload the page to get your nutritional advice
                </p>
            </div>
        );
    }
    const parsedPreferences = JSON.parse(fetchedUserPreferences.data);

    // Create a user object that matches the expected interface
    const user = {
        id: userId,
        email: userProfile.email,
        name: userProfile.name,
    };

    return (
        <div className="flex flex-col items-center justify-center flex-grow w-full">
            <div className="flex flex-col flex-grow items-center justify-start p-4 w-full">
                <h1 className="text-center text-2xl font-bold text-slate-800">Congratulations🎉</h1>
                <div className="mb-8">
                    <p className="text-center text-slate-600">
                        You have successfully completed the onboarding process.
                        You can now start using the app to track your nutrition and fitness goals.
                    </p>
                    <p className="text-center text-slate-600">
                        Check out your AI calculated daily calories and macronutrients, based on your data.
                    </p>
                </div>
                <OnboardingResultClient parsedPreferences={parsedPreferences} user={user} />
            </div>
        </div>
    );
}
