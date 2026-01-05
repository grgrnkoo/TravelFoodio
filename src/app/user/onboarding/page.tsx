import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingPageContent from "@/components/OnboardingPageContent";

export const metadata = {
    title: "Onboarding | TravelFoodio",
};

export default async function OnboardingPage() {
    const { userId } = await auth();
    
    if (!userId) {
        return redirect("/sign-in?error=sign-out");
    }

    return <OnboardingPageContent />;
}
