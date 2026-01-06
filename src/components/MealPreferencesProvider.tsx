'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useMealPreferences } from '@/app/hooks/useMealPreferences'
import { UserContext } from './UserProvider'
import type { IUserMeal } from '@/types'

interface MealPreferencesContextValue {
    favoriteMeals: IUserMeal[];
    dislikedMeals: IUserMeal[];
    isLoading: boolean;
    likeMeal: (meal: { name: string; ingredients?: string[]; cuisine?: string }) => Promise<void>;
    dislikeMeal: (meal: { name: string; ingredients?: string[]; cuisine?: string }) => Promise<void>;
}

const MealPreferencesContext = createContext<MealPreferencesContextValue | undefined>(undefined)

export function useMealPreferencesContext(): MealPreferencesContextValue {
    const ctx = useContext(MealPreferencesContext)
    if (!ctx) {
        throw new Error('useMealPreferencesContext must be used within MealPreferencesProvider')
    }
    return ctx
}

export function MealPreferencesProvider({ children }: { children: ReactNode }) {
    const { userProfileDynamic } = useContext(UserContext)
    const userId = userProfileDynamic?._id ?? userProfileDynamic?.id ?? null
    const { favoriteMeals, dislikedMeals, isLoading, likeMeal, dislikeMeal } = useMealPreferences(userId)

    return (
        <MealPreferencesContext.Provider
            value={{
                favoriteMeals,
                dislikedMeals,
                isLoading,
                likeMeal,
                dislikeMeal,
            }}
        >
            {children}
        </MealPreferencesContext.Provider>
    )
}


