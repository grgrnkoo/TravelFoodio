"use client"

import React, { createContext, useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

import { IUser, IUserCore } from "../../types";

interface UserContextType {
    userId: string | null;
    userProfile: IUser | null;
    userProfileDynamic: IUser | null;
    setUserProfileDynamic: React.Dispatch<React.SetStateAction<IUser | null>>;
    refreshUserProfile: () => Promise<void>;
    isLoading: boolean;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

interface UserProviderProps {
    value: {
        userId: string | null;
        userProfile: IUser | null;
    };
    children: React.ReactNode;
}

// Transform API response to IUser format for backwards compatibility
function transformApiResponse(data: Record<string, unknown>): IUser {
    return {
        id: (data.id || data._id) as string,
        _id: (data._id || data.id) as string,
        clerkUserId: data.clerkUserId as string,
        email: data.email as string,
        image: (data.image as string) || undefined,
        name: (data.name as string) || undefined,
        age: (data.age as number) || undefined,
        location: (data.location as string) || undefined,
        dailyCaloriesSuggested: (data.dailyCaloriesSuggested as number) || undefined,
        goals: (data.goals as string) || undefined,
        dietaryRestrictions: (data.dietaryRestrictions as string) || undefined,
        favoriteMeals: (data.favoriteMeals as IUser['favoriteMeals']) || [],
        dislikedMeals: (data.dislikedMeals as IUser['dislikedMeals']) || [],
        ingredients: (data.ingredients as IUser['ingredients']) || [],
        cuisines: (data.cuisines as IUser['cuisines']) || [],
        updatesRemaining: (data.updatesRemaining as number) || 0,
        subscriptionType: (data.subscriptionType as string) || 'free',
        onboardingCompleted: (data.onboardingCompleted as boolean) || false,
        createdAt: data.createdAt as string | undefined,
        updatedAt: data.updatedAt as string | undefined,
    };
}

export default function UserProvider({ value, children }: UserProviderProps) {
    const { userId: serverUserId, userProfile } = value;
    const { user: clerkUser } = useUser();
    const [userProfileDynamic, setUserProfileDynamic] = useState<IUser | null>(userProfile);
    const [isLoading, setIsLoading] = useState(!userProfile);

    const userId = clerkUser?.id || serverUserId;

    const createUserInDB = useCallback(async (userId: string, clerkUserData: typeof clerkUser) => {
        try {
            const email = clerkUserData?.emailAddresses?.[0]?.emailAddress;
            if (!email) {
                console.error("No email found for user");
                return null;
            }

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clerkUserId: userId,
                    email: email,
                    name: clerkUserData?.fullName || clerkUserData?.firstName || '',
                    image: clerkUserData?.imageUrl || '',
                    onboardingCompleted: false,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Failed to create user:", error);
                return null;
            }
            
            console.log("✅ User created successfully in Supabase");
            const data = await response.json();
            return transformApiResponse(data);
        } catch (error) {
            console.error("Error creating user:", error);
            return null;
        }
    }, []);

    const fetchProfile = useCallback(async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/users/clerk/${userId}`);
            
            // Check if response is JSON before parsing
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.warn("Received non-JSON response from user API");
                
                // If user not found, try to create them
                if (response.status === 404 && clerkUser?.emailAddresses?.[0]?.emailAddress) {
                    console.log("User not found in DB, attempting to create...");
                    const newUser = await createUserInDB(userId, clerkUser);
                    if (newUser) {
                        setUserProfileDynamic(newUser);
                    }
                }
                return;
            }

            const data = await response.json();
            
            if (response.ok) {
                setUserProfileDynamic(transformApiResponse(data));
            } else if (response.status === 404 && clerkUser?.emailAddresses?.[0]?.emailAddress) {
                // User doesn't exist in Supabase, create them
                console.log("User not found in DB, attempting to create...");
                const newUser = await createUserInDB(userId, clerkUser);
                if (newUser) {
                    setUserProfileDynamic(newUser);
                }
            } else {
                console.error("Failed to fetch profile:", data);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, clerkUser, createUserInDB]);

    // Refresh function for manual refresh
    const refreshUserProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        // Skip if we already have a profile
        if (userProfileDynamic) {
            setIsLoading(false);
            return;
        }

        fetchProfile();
    }, [userId, userProfileDynamic, fetchProfile]);

    return (
        <UserContext.Provider value={{ 
            userId, 
            userProfile, 
            userProfileDynamic, 
            setUserProfileDynamic,
            refreshUserProfile,
            isLoading
        }}>
            {children}
        </UserContext.Provider>
    )
}
