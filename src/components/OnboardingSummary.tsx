'use client'

import { useSearchParams } from "next/navigation"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { saveUserPreferencesToDb, setOnboardingProp } from "../../_lib/onboardingFunctions"
import { usePopup } from "./providers/PopUpProvider"
import { useState, useEffect } from "react"
import { useSession } from "@clerk/nextjs"
import { generateMedicalRestrictions } from "../../_lib/generateMedicalRestrictions"
import RestrictedRecommendationsDisplay from "./RestrictedRecommendationsDisplay"

interface UserFromSession {
    id?: string;
    email: string;
    name?: string;
}

interface OnboardingSummaryProps {
    userFromSession: UserFromSession;
}

export default function OnboardingSummary({ userFromSession }: OnboardingSummaryProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showPopup } = usePopup();
    const { session, isLoaded: isSessionLoaded } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Read customGoal from localStorage
    const [customGoal, setCustomGoal] = useState("");
    
    // Medical restrictions state
    const [restrictedRecommendations, setRestrictedRecommendations] = useState<string[]>([]);
    const [isLoadingRestrictions, setIsLoadingRestrictions] = useState(false);
    const [restrictionsError, setRestrictionsError] = useState<string>("");

    useEffect(() => {
        const stored = localStorage.getItem('customGoal');
        if (stored) {
            setCustomGoal(stored);
        }
    }, []);

    // Get data from search params
    const name = searchParams.get("name") || userFromSession.name || "";
    const day = searchParams.get("day") || "";
    const month = searchParams.get("month") || "";
    const year = searchParams.get("year") || "";
    const location = searchParams.get("location") || "";
    const goal = searchParams.get("goal") || "";
    const dietaryRestrictions = searchParams.get("dietaryRestrictions") || "";
    const weight = searchParams.get("weight") || "";
    const weightUnit = searchParams.get("weightUnit") || "kg";
    const height = searchParams.get("height") || "";
    const heightUnit = searchParams.get("heightUnit") || "cm";
    const otherInfo = searchParams.get("otherInfo") || "";

    const formattedDate = day && month && year 
        ? new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
        : null;

    // Calculate age from date of birth
    const calculateAge = (date: Date | null): number | undefined => {
        if (!date) return undefined;
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            age--;
        }
        return age;
    };

    const userAge = calculateAge(formattedDate);

    // Fetch medical restrictions on mount if dietaryRestrictions or otherInfo exist
    useEffect(() => {
        const fetchRestrictions = async () => {
            // Wait for session to be loaded before making authenticated API calls
            if (!isSessionLoaded) {
                console.log('[OnboardingSummary] Waiting for session to load...');
                return;
            }

            // Only fetch if we have dietary restrictions or other info
            if (!dietaryRestrictions && !otherInfo) {
                return;
            }

            console.log('[OnboardingSummary] Session loaded, fetching restrictions...');
            setIsLoadingRestrictions(true);
            setRestrictionsError("");

            try {
                const result = await generateMedicalRestrictions({
                    dietaryRestrictions: dietaryRestrictions || undefined,
                    otherInfo: otherInfo || undefined,
                    age: userAge,
                });

                if (result.error) {
                    setRestrictionsError(result.error);
                    setRestrictedRecommendations([]);
                } else if (result.recommendations) {
                    setRestrictedRecommendations(result.recommendations);
                } else {
                    setRestrictedRecommendations([]);
                }
            } catch (error) {
                console.error("Error fetching restrictions:", error);
                setRestrictionsError("Failed to analyze restrictions");
                setRestrictedRecommendations([]);
            } finally {
                setIsLoadingRestrictions(false);
            }
        };

        fetchRestrictions();
    }, [dietaryRestrictions, otherInfo, isSessionLoaded, userAge]);

    const handleRemoveRecommendation = (index: number) => {
        setRestrictedRecommendations(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddRecommendation = (recommendation: string) => {
        // Avoid duplicates (case-insensitive check)
        if (!restrictedRecommendations.some(r => r.toLowerCase() === recommendation.toLowerCase())) {
            setRestrictedRecommendations(prev => [...prev, recommendation]);
        }
    };

    const handleConfirm = async () => {
        if (!userFromSession.id) {
            showPopup("User ID not found", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedUserData = {
                name: name || null,
                formattedDate: formattedDate || undefined,
                dateOfBirthday: formattedDate || undefined,
                location,
                goal: goal === "custom" ? customGoal : goal,
                dietaryRestrictions: dietaryRestrictions || null,
                otherInfo: otherInfo || null,
                weight: `${weight} ${weightUnit}`,
                height: `${height} ${heightUnit}`,
                medicalRecommendations: restrictedRecommendations.length > 0 ? restrictedRecommendations : undefined,
            };

            const user = {
                id: userFromSession.id,
                email: userFromSession.email,
                name: userFromSession.name,
            };

            const result = await saveUserPreferencesToDb(formattedUserData, user, 'POST');
            
            if (result.status !== 200) {
                throw new Error(result.message || "Failed to save preferences");
            }

            await setOnboardingProp(user, '1');

            // Clear customGoal from localStorage after successful save
            localStorage.removeItem('customGoal');

            if (session) {
                await session.reload();
            }

            showPopup("Preferences saved!", "success");
            router.push("/user/onboarding/result");
        } catch (error) {
            console.error("Error saving preferences:", error);
            showPopup(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatGoal = (goal: string, customGoal: string) => {
        if (goal === "custom") {
            return customGoal || "Custom Goal";
        }
        return goal.split("-").map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");
    };

    return (
        <div className="w-full max-w-lg space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {name && (
                        <div>
                            <p className="text-sm text-slate-500">Name</p>
                            <p className="font-medium">{name}</p>
                        </div>
                    )}
                    
                    {formattedDate && (
                        <div>
                            <p className="text-sm text-slate-500">Date of Birth</p>
                            <p className="font-medium">{formattedDate.toLocaleDateString()}</p>
                        </div>
                    )}

                    {location && (
                        <div>
                            <p className="text-sm text-slate-500">Location</p>
                            <p className="font-medium">{location}</p>
                        </div>
                    )}

                    {goal && (
                        <div>
                            <p className="text-sm text-slate-500">Goal</p>
                            <p className="font-medium">{formatGoal(goal, customGoal)}</p>
                        </div>
                    )}

                    {weight && (
                        <div>
                            <p className="text-sm text-slate-500">Weight</p>
                            <p className="font-medium">{weight} {weightUnit}</p>
                        </div>
                    )}

                    {height && (
                        <div>
                            <p className="text-sm text-slate-500">Height</p>
                            <p className="font-medium">{height} {heightUnit}</p>
                        </div>
                    )}
                </div>

                {dietaryRestrictions && (
                    <div>
                        <p className="text-sm text-slate-500">Dietary Restrictions</p>
                        <p className="font-medium">{dietaryRestrictions}</p>
                    </div>
                )}

                {otherInfo && (
                    <div>
                        <p className="text-sm text-slate-500">Additional Info</p>
                        <p className="font-medium">{otherInfo}</p>
                    </div>
                )}
            </div>

            {/* Display restricted ingredients if we have dietary restrictions or other info */}
            {(dietaryRestrictions || otherInfo) && (
                <RestrictedRecommendationsDisplay
                    recommendations={restrictedRecommendations}
                    isLoading={isLoadingRestrictions}
                    error={restrictionsError}
                    onRemove={handleRemoveRecommendation}
                    onAdd={handleAddRecommendation}
                />
            )}

            <div className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    Go Back
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    {isSubmitting ? "Saving..." : "Confirm & Continue"}
                </Button>
            </div>
        </div>
    );
}

