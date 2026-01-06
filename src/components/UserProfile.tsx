"use client";

import { useContext, useState, useEffect } from "react";
import { UserContext, UserProfileDynamic } from "./UserProvider";
import Image from "next/image";
import UserProfileLine from "./UserProfileLine";
import { YesNoPopUp } from "./YesNoPopUp";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PencilIcon, UserIcon, MapPinIcon, TargetIcon, UtensilsIcon, Cookie, Scale, Ruler, HeartPulse, FileText, Calendar, Trash2 } from "lucide-react";
import { updateUserByEmail } from "../../_lib/usersActions";
import BlankAvatarSvg from "@/ui/images/BlankAvatarSvg";
import MedicalRecommendationsEditor from "./MedicalRecommendationsEditor";

const updateUser = async (email: string, field: string, value: unknown) => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${baseUrl}/api/users/${email}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: field, value }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error sending update request:', errorData);
            return { success: false, error: errorData };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error in update user function:', error);
        return { success: false, error };
    }
};

export default function UserProfile({ className, editable = false }: { className: string, editable: boolean }) {
    const { userProfile, userProfileDynamic, setUserProfileDynamic } = useContext(UserContext);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<{ id: string; value: unknown; resolve: (value: boolean) => void } | null>(null);
    const [popUpContent, setPopUpContent] = useState<React.ReactNode>("");
    const [oneEditingFieldBoolean, setOneEditingFieldBoolean] = useState(false);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(!!userProfile?.email);

    // Fetch preferences on mount
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!userProfile?.email) {
                setIsLoadingPreferences(false);
                return;
            }
            
            setIsLoadingPreferences(true);
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
                const response = await fetch(`${baseUrl}/api/users/${userProfile.email}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserProfileDynamic(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            weight: data.weight || '',
                            height: data.height || '',
                            medicalRecommendations: data.medicalRecommendations || [],
                            otherInfo: data.otherInfo || '',
                            dateOfBirth: data.dateOfBirth || undefined,
                            age: data.age ?? prev.age,
                            location: data.location ?? prev.location,
                            dailyCaloriesSuggested: data.dailyCaloriesSuggested ?? prev.dailyCaloriesSuggested,
                            goals: data.goals ?? prev.goals,
                            dietaryRestrictions: data.dietaryRestrictions ?? prev.dietaryRestrictions,
                        } as UserProfileDynamic;
                    });
                }
            } catch (error) {
                console.error('Error fetching preferences:', error);
            } finally {
                setIsLoadingPreferences(false);
            }
        };

        fetchPreferences();
    }, [userProfile?.email, setUserProfileDynamic]);

    const confirmUpdate = (id: string, value: unknown) => {
        return new Promise<boolean>((resolve) => {
            setPendingUpdate({ id, value, resolve });
            setPopUpContent(generatePopUpContent(id, value));
            setIsPopupOpen(true);
        });
    };

    const handleChoice = (choice: boolean) => {
        if (choice && pendingUpdate) {
            patchUserData(pendingUpdate.id, pendingUpdate.value);
            pendingUpdate.resolve(true);
        } else {
            pendingUpdate?.resolve(false);
        }
        setPendingUpdate(null);
        setIsPopupOpen(false);
        setOneEditingFieldBoolean(false); // Reset editing lock
    };

    const patchUserData = async (id: string, value: unknown) => {
        // Optimistic update
        setUserProfileDynamic(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [id]: value
            } as UserProfileDynamic;
        });
        
        if (userProfile?.email) {
            const result = await updateUser(userProfile.email, id, value);
            if (result.success && result.data) {
                // Update with server response to ensure consistency
                setUserProfileDynamic(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        ...result.data
                    } as UserProfileDynamic;
                });
            }
        }
    };

    const handleDisableImage = async () => {
        if (!userProfile?.email) return;
        const confirmed = window.confirm('Are you sure you want to remove your profile image?');
        if (confirmed) {
            await patchUserData('image', '');
        }
    };

    const handleMedicalRecommendationsChange = (recommendations: string[]) => {
        // Update optimistically without popup (like in OnboardingSummary)
        setUserProfileDynamic(prev => {
            if (!prev) return null;
            return {
                ...prev,
                medicalRecommendations: recommendations
            } as UserProfileDynamic;
        });
        
        // Save to database
        if (userProfile?.email) {
            updateUser(userProfile.email, 'medicalRecommendations', recommendations);
        }
    };

    const generatePopUpContent = (id: string, value: unknown) => {
        const currentValue = userProfileDynamic?.[id as keyof typeof userProfileDynamic];
        let displayCurrent = '';
        let displayNew = '';

        if (Array.isArray(currentValue)) {
            displayCurrent = currentValue.length > 0 ? currentValue.join(', ') : 'None';
        } else {
            displayCurrent = currentValue ? String(currentValue) : 'None';
        }

        if (Array.isArray(value)) {
            displayNew = value.length > 0 ? value.join(', ') : 'None';
        } else {
            displayNew = value ? String(value) : 'None';
        }

        return (
            <span>
                {`You are changing value from "`}
                <strong>{displayCurrent}</strong>
                {`" to "`}
                <strong>{displayNew}</strong>
                {`"`}
            </span>
        );
    };

    if (!userProfile || isLoadingPreferences || !userProfileDynamic) {
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
        <Card className={`mx-auto mb-8 shadow-lg border-0 overflow-hidden mt-4 h-fit max-w-4xl ${className}`}>
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
                                />
                            ) : (
                                <BlankAvatarSvg />
                            )
                        }
                    </div>
                    <Badge variant="outline" className="mb-2 font-semibold px-3 py-1">
                        {userProfile?.email}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6 space-y-4" key="CardContent">
                {[
                    {
                        userData: userProfileDynamic?.name,
                        id: "name",
                        nameOfLine: "Name",
                        icon: <UserIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.age,
                        nameOfLine: "Age",
                        id: "age",
                        editable,
                        icon: <PencilIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.dateOfBirth,
                        nameOfLine: "Date of Birth",
                        id: "dateOfBirth",
                        editable,
                        inputType: "date",
                        icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.weight,
                        nameOfLine: "Weight",
                        id: "weight",
                        editable,
                        icon: <Scale className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.height,
                        nameOfLine: "Height",
                        id: "height",
                        editable,
                        icon: <Ruler className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.dailyCaloriesSuggested,
                        nameOfLine: "Est. kcal daily",
                        id: "dailyCaloriesSuggested",
                        editable,
                        inputType: "number",
                        icon: <Cookie className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.location,
                        nameOfLine: "Location",
                        id: "location",
                        editable,
                        icon: <MapPinIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.goals,
                        nameOfLine: "Goals",
                        id: "goals",
                        editable,
                        icon: <TargetIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.dietaryRestrictions,
                        nameOfLine: "Dietary Restrictions",
                        id: "dietaryRestrictions",
                        editable,
                        icon: <UtensilsIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.medicalRecommendations,
                        nameOfLine: "Medical Recommendations",
                        id: "medicalRecommendations",
                        editable: false, // Always show editor, no popup needed
                        customComponent: editable ? (
                            <MedicalRecommendationsEditor
                                recommendations={Array.isArray(userProfileDynamic?.medicalRecommendations) ? userProfileDynamic.medicalRecommendations : []}
                                onChange={handleMedicalRecommendationsChange}
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2 items-center">
                                {Array.isArray(userProfileDynamic?.medicalRecommendations) && userProfileDynamic.medicalRecommendations.length > 0 ? (
                                    userProfileDynamic.medicalRecommendations.map((rec: string, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                                            {rec}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-sm">None</span>
                                )}
                            </div>
                        ),
                        icon: <HeartPulse className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.otherInfo,
                        nameOfLine: "Other Info",
                        id: "otherInfo",
                        editable,
                        inputType: "textarea",
                        icon: <FileText className="h-4 w-4 text-muted-foreground" />,
                    },
                    ...(editable && userProfileDynamic?.image ? [{
                        userData: "Remove profile image",
                        nameOfLine: "Profile Image",
                        id: "disableImage",
                        editable: false,
                        customComponent: (
                            <Button
                                variant="destructive"
                                onClick={handleDisableImage}
                                className="w-fit"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Image
                            </Button>
                        ),
                        icon: <Trash2 className="h-4 w-4 text-muted-foreground" />,
                    }] : []),
                ]
                    .filter((item) => {
                        // Filter out empty fields, but keep medicalRecommendations and otherInfo even if empty
                        if (item.id === "medicalRecommendations" || item.id === "otherInfo") {
                            return true;
                        }
                        return item.userData !== undefined && item.userData !== "" && item.userData !== 0;
                    })
                    .map((item, index, arr) => (
                        <div key={item.id}>
                            <UserProfileLine
                                userData={item.userData}
                                nameOfLine={item.nameOfLine}
                                id={item.id}
                                editable={item.editable}
                                styleProp={item.id === "name" ? "font-bold" : ""}
                                setOneEditingFieldBoolean={setOneEditingFieldBoolean}
                                oneEditingFieldBoolean={oneEditingFieldBoolean}
                                confirmUpdate={confirmUpdate}
                                isPopupOpen={isPopupOpen}
                                setIsPopupOpen={setIsPopupOpen}
                                icon={item.icon}
                                inputType={item.inputType}
                                customComponent={item.customComponent}
                            />
                            {index !== arr.length - 1 && <Separator />}
                        </div>
                    ))}
            </CardContent>
            {
                isPopupOpen && (
                    <YesNoPopUp
                        title="Confirm updates"
                        isOpen={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                        onChoice={handleChoice}
                        content={popUpContent}
                        yesLabel="Confirm"
                        noLabel="Decline"
                    />
                )
            }
        </Card >
    );
}