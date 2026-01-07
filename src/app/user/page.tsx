'use client'

import { useEffect, useState, useContext } from 'react'
import NutritionBar from '@/components/NutritionBar'
import { UserContext } from '@/components/UserProvider'

interface DailyNutrition {
    consumed: {
        calories: number
        carbs: number
        protein: number
        fat: number
    }
    goals: {
        calories: number
        carbs: number
        protein: number
        fat: number
    }
}

export default function UserHomepage() {
    const { userId } = useContext(UserContext)
    const [nutrition, setNutrition] = useState<DailyNutrition | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchNutrition = async () => {
            try {
                const response = await fetch('/api/daily-nutrition')
                if (!response.ok) {
                    throw new Error('Failed to fetch nutrition data')
                }

                const data = await response.json()
                if (data.success) {
                    setNutrition({
                        consumed: data.consumed,
                        goals: data.goals,
                    })
                }
            } catch (error) {
                console.error('Error fetching nutrition:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchNutrition()
    }, [userId])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[400px]">
                <div className="animate-pulse space-y-4 w-full max-w-lg">
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-48 bg-gray-200 rounded-lg"></div>
                        <div className="h-48 bg-gray-200 rounded-lg"></div>
                        <div className="h-48 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!nutrition) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[400px]">
                <p className="text-muted-foreground">No nutrition data available</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full py-8">
            <h1 className="text-3xl font-bold mb-8">Daily Nutrition Tracker</h1>
            <NutritionBar
                isLoadedPassed={!loading}
                calories={{
                    consumed: nutrition.consumed.calories,
                    goal: nutrition.goals.calories || 2000,
                }}
                carbs={{
                    consumed: nutrition.consumed.carbs,
                    goal: nutrition.goals.carbs || 250,
                }}
                protein={{
                    consumed: nutrition.consumed.protein,
                    goal: nutrition.goals.protein || 150,
                }}
                fat={{
                    consumed: nutrition.consumed.fat,
                    goal: nutrition.goals.fat || 65,
                }}
                onboarding={false}
            />
            {nutrition.consumed.calories === 0 && (
                <p className="mt-6 text-center text-muted-foreground">
                    Start tracking your meals by adding them from your menu!
                </p>
            )}
        </div>
    )
}
