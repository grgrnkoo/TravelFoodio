"use client"

import React, { createContext, useState } from "react";
import { IUserCore } from "../../types";

// Extended user type that includes core data plus optional preference arrays
// that may be added dynamically by components
interface UserProfileDynamic extends IUserCore {
    _id?: string; // Backwards compatibility alias
    favoriteMeals?: Array<{ name: string; dateLastUpdated?: string | Date }>;
    dislikedMeals?: Array<{ name: string; dateLastUpdated?: string | Date }>;
    ingredients?: Array<{ name: string; rating: number; dateLastUpdated?: string | Date }>;
    cuisines?: Array<{ name: string; rating: number; dateLastUpdated?: string | Date }>;
}

interface UserContextType {
    userId: string | null;
    userProfile: UserProfileDynamic | null;
    userProfileDynamic: UserProfileDynamic | null;
    setUserProfileDynamic: React.Dispatch<React.SetStateAction<UserProfileDynamic | null>>;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

interface UserProviderProps {
    value: {
        userId: string | null;
        userProfile: IUserCore | null;
    };
    children: React.ReactNode;
}

export default function UserProvider({ value, children }: UserProviderProps) {
    const { userId, userProfile } = value;
    
    // Transform IUserCore to UserProfileDynamic with backwards compat
    const initialProfile: UserProfileDynamic | null = userProfile 
        ? { ...userProfile, _id: userProfile.id }
        : null;
    
    const [userProfileDynamic, setUserProfileDynamic] = useState<UserProfileDynamic | null>(initialProfile);

    return (
        <UserContext.Provider value={{ 
            userId, 
            userProfile: initialProfile, 
            userProfileDynamic, 
            setUserProfileDynamic,
        }}>
            {children}
        </UserContext.Provider>
    );
}
