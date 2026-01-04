'use client'

import NutritionBar from "@/components/NutritionBar"
import { useState, useEffect } from "react"
import { finaliseOnboarding, saveAiResponseToDb, setOnboardingProp } from "../../_lib/onboardingFunctions"
import { AIReplyFormatted, User, UserOnboardingFormatted } from "../../_lib/interfaces"
import { JSX } from "react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { usePopup } from "./providers/PopUpProvider"
import { useSession } from "@clerk/nextjs"

export default function OnboardingResultClient({
    parsedPreferences,
    user,
}: {
    parsedPreferences: UserOnboardingFormatted;
    user: User;
}): JSX.Element {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [aiReplyResponse, setAiReplyResponse] = useState<{
        dailyKcalSuggested: number;
        dailyCarbsSuggested: number;
        dailyProteinsSuggested: number;
        dailyFatsSuggested: number;
        motivationalMessage?: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { showPopup } = usePopup();
    const { session } = useSession();

    useEffect(() => {
        const fetchAIResponse = async () => {
            try {
                const response = await finaliseOnboarding({
                    userFromSession: user,
                    formattedUserData: parsedPreferences,
                });
                if (response.status !== 200) {
                    throw new Error("Error during AI request");
                }
                setAiReplyResponse(JSON.parse(response.message));
                setIsLoaded(true);
            } catch (err) {
                console.error(err);
                setError("Error generating your nutrition. Please reload the page.");
                setIsLoaded(true);
            }
        };

        fetchAIResponse();
    }, [user, parsedPreferences]);

    console.log('aiResponse: ', aiReplyResponse);

    const handleFinalise = async () => {
        if (!aiReplyResponse) return;
        
        setIsLoaded(false);

        const formattedAiReplyData: AIReplyFormatted = {
            dailyKcalSuggested: aiReplyResponse.dailyKcalSuggested,
            dailyCarbsSuggested: aiReplyResponse.dailyCarbsSuggested,
            dailyProteinsSuggested: aiReplyResponse.dailyProteinsSuggested,
            dailyFatsSuggested: aiReplyResponse.dailyFatsSuggested
        };

        try {
            const res = await saveAiResponseToDb(formattedAiReplyData, user);
            if (res.status !== 200) {
                throw new Error('Error saving preferences');
            }
            await setOnboardingProp(user, '2');
            
            // Reload the Clerk session to reflect updated user metadata
            if (session) {
                await session.reload();
            }
            
            showPopup(`Your data saved`, 'success');
            router.push('/user');
        } catch (error) {
            setIsLoaded(true);
            showPopup(`Error: ${error}`, 'error');
            console.error('Error during onboarding process:', error);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center gap-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <>
            <NutritionBar
                isLoadedPassed={isLoaded}
                calories={{
                    consumed: isLoaded && aiReplyResponse ? aiReplyResponse.dailyKcalSuggested : 0,
                    goal: isLoaded && aiReplyResponse ? aiReplyResponse.dailyKcalSuggested : 0
                }}
                carbs={{
                    consumed: isLoaded && aiReplyResponse ? aiReplyResponse.dailyCarbsSuggested : 0,
                    goal: isLoaded && aiReplyResponse ? aiReplyResponse.dailyCarbsSuggested : 0
                }}
                protein={{
                    consumed: isLoaded && aiReplyResponse ? aiReplyResponse.dailyProteinsSuggested : 0,
                    goal: isLoaded && aiReplyResponse ? aiReplyResponse.dailyProteinsSuggested : 0
                }}
                fat={{
                    consumed: isLoaded && aiReplyResponse ? aiReplyResponse.dailyFatsSuggested : 0,
                    goal: isLoaded && aiReplyResponse ? aiReplyResponse.dailyFatsSuggested : 0
                }}
                onboarding={true}
            />
            <p className="my-4 text-center text-slate-600">
                {isLoaded && aiReplyResponse ? aiReplyResponse.motivationalMessage : ''}
            </p>
            <Button
                disabled={!isLoaded}
                variant="default"
                onClick={handleFinalise}
                className="cursor-pointer"
            >
                Start using FoodSmart
            </Button>
        </>
    );
}
