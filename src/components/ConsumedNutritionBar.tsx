'use client'

import { useEffect, useState } from 'react'
import NutritionBar from '@/components/NutritionBar'

interface ConsumedNutritionBarProps {
    date: string
    goals: {
        calories: number
        carbs: number
        protein: number
        fat: number
    }
    initialNutrition: {
        calories: number
        carbs: number
        protein: number
        fats: number
    }
}

export default function ConsumedNutritionBar({ date, goals, initialNutrition }: ConsumedNutritionBarProps) {
    const [nutrition, setNutrition] = useState(initialNutrition)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchNutrition = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/daily-nutrition?date=${date}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch nutrition data')
                }

                const data = await response.json()
                if (data.success) {
                    setNutrition({
                        calories: data.consumed.calories,
                        carbs: data.consumed.carbs,
                        protein: data.consumed.protein,
                        fats: data.consumed.fat,
                    })
                }
            } catch (error) {
                console.error('Error fetching nutrition:', error)
            } finally {
                setLoading(false)
            }
        }

        // Listen for custom event when meals are added/removed
        const handleMealChange = () => {
            fetchNutrition()
        }

        window.addEventListener('consumedMealChanged', handleMealChange)

        return () => {
            window.removeEventListener('consumedMealChanged', handleMealChange)
        }
    }, [date])

    return (
        <div className="w-full flex justify-center my-6">
            <NutritionBar
                isLoadedPassed={true}
                calories={{
                    consumed: nutrition.calories,
                    goal: goals.calories,
                }}
                carbs={{
                    consumed: nutrition.carbs,
                    goal: goals.carbs,
                }}
                protein={{
                    consumed: nutrition.protein,
                    goal: goals.protein,
                }}
                fat={{
                    consumed: nutrition.fats,
                    goal: goals.fat,
                }}
                onboarding={false}
            />
        </div>
    )
}

