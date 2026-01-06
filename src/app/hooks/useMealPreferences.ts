'use client'

import { useCallback, useEffect, useState } from 'react'
import type { IUserMeal } from '../../../types'

interface MealPreferencesState {
    favoriteMeals: IUserMeal[];
    dislikedMeals: IUserMeal[];
    isLoading: boolean;
    error: string | null;
}

interface UseMealPreferencesResult extends MealPreferencesState {
    likeMeal: (meal: { name: string; ingredients?: string[]; cuisine?: string }) => Promise<void>;
    dislikeMeal: (meal: { name: string; ingredients?: string[]; cuisine?: string }) => Promise<void>;
}

export function useMealPreferences(userId: string | null | undefined): UseMealPreferencesResult {
    const [state, setState] = useState<MealPreferencesState>({
        favoriteMeals: [],
        dislikedMeals: [],
        isLoading: !!userId,
        error: null,
    })

    useEffect(() => {
        if (!userId) {
            setState(prev => ({ ...prev, isLoading: false }))
            return
        }

        let cancelled = false

        const fetchPreferences = async () => {
            setState(prev => ({ ...prev, isLoading: true, error: null }))
            try {
                const res = await fetch(`/api/fetchPreferences/${userId}`)
                if (!res.ok) {
                    throw new Error(`Failed to fetch preferences: ${res.status}`)
                }
                const json = await res.json()
                const raw = json?.data ? JSON.parse(json.data) : json

                if (cancelled) return

                setState({
                    favoriteMeals: raw.favoriteMeals ?? [],
                    dislikedMeals: raw.dislikedMeals ?? [],
                    isLoading: false,
                    error: null,
                })
            } catch (error) {
                if (cancelled) return
                const message = error instanceof Error ? error.message : 'Unknown error'
                console.error('[useMealPreferences] Fetch error:', message)
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: message,
                }))
            }
        }

        fetchPreferences()

        return () => {
            cancelled = true
        }
    }, [userId])

    const mutatePreference = useCallback(
        async (
            action: 'like' | 'dislike',
            meal: { name: string; ingredients?: string[]; cuisine?: string }
        ) => {
            if (!userId) return

            setState(prev => {
                const { favoriteMeals, dislikedMeals } = prev
                const mealName = meal.name

                const next: MealPreferencesState = {
                    ...prev,
                    favoriteMeals,
                    dislikedMeals,
                }

                if (action === 'like') {
                    const isLiked = favoriteMeals.some(m => m.name === mealName)
                    const isDisliked = dislikedMeals.some(m => m.name === mealName)

                    next.favoriteMeals = isLiked
                        ? favoriteMeals.filter(m => m.name !== mealName)
                        : [...favoriteMeals, { name: mealName, dateLastUpdated: new Date().toISOString() }]
                    next.dislikedMeals = isDisliked
                        ? dislikedMeals.filter(m => m.name !== mealName)
                        : dislikedMeals.filter(m => m.name !== mealName)
                } else {
                    const isLiked = favoriteMeals.some(m => m.name === mealName)
                    const isDisliked = dislikedMeals.some(m => m.name === mealName)

                    next.dislikedMeals = isDisliked
                        ? dislikedMeals.filter(m => m.name !== mealName)
                        : [...dislikedMeals, { name: mealName, dateLastUpdated: new Date().toISOString() }]
                    next.favoriteMeals = isLiked
                        ? favoriteMeals.filter(m => m.name !== mealName)
                        : favoriteMeals.filter(m => m.name !== mealName)
                }

                return next
            })

            try {
                const res = await fetch('/api/preferenceUpdate', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, meal, action }),
                })

                if (!res.ok) {
                    throw new Error(`Request failed with status ${res.status}`)
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'
                console.error('[useMealPreferences] Mutation error:', message)
                // On failure, refetch from server to restore a consistent state
                if (userId) {
                    try {
                        const res = await fetch(`/api/fetchPreferences/${userId}`)
                        if (res.ok) {
                            const json = await res.json()
                            const raw = json?.data ? JSON.parse(json.data) : json
                            setState(prev => ({
                                ...prev,
                                favoriteMeals: raw.favoriteMeals ?? [],
                                dislikedMeals: raw.dislikedMeals ?? [],
                            }))
                        }
                    } catch {
                        // swallow; error already logged
                    }
                }
            }
        },
        [userId]
    )

    const likeMeal = useCallback(
        async (meal: { name: string; ingredients?: string[]; cuisine?: string }) => {
            await mutatePreference('like', meal)
        },
        [mutatePreference]
    )

    const dislikeMeal = useCallback(
        async (meal: { name: string; ingredients?: string[]; cuisine?: string }) => {
            await mutatePreference('dislike', meal)
        },
        [mutatePreference]
    )

    return {
        ...state,
        likeMeal,
        dislikeMeal,
    }
}


