'use client'

import { useState, useEffect, useCallback } from 'react'
import type { IConsumedMeal } from '@/types'

interface ConsumedMealData {
    mealName: string
    calories?: number
    protein?: number
    fats?: number
    carbs?: number
    weight?: number
    cuisine?: string
    ingredients?: string[]
}

interface UseConsumedMealsReturn {
    consumedMeals: IConsumedMeal[]
    consumedCounts: Record<string, number>
    loading: boolean
    error: string | null
    addConsumedMeal: (mealData: ConsumedMealData) => Promise<boolean>
    removeConsumedMeal: (mealId: string) => Promise<boolean>
    getConsumedCount: (mealName: string) => number
    refreshConsumedMeals: () => Promise<void>
}

export function useConsumedMeals(date?: string): UseConsumedMealsReturn {
    const [consumedMeals, setConsumedMeals] = useState<IConsumedMeal[]>([])
    const [consumedCounts, setConsumedCounts] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const targetDate = date || new Date().toISOString().split('T')[0]

    const fetchConsumedMeals = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`/api/consumed-meals?date=${targetDate}`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch consumed meals')
            }

            const data = await response.json()
            if (data.success && data.meals) {
                setConsumedMeals(data.meals)
                
                // Calculate counts per meal name
                const counts: Record<string, number> = {}
                data.meals.forEach((meal: IConsumedMeal) => {
                    counts[meal.mealName] = (counts[meal.mealName] || 0) + 1
                })
                setConsumedCounts(counts)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(message)
            console.error('Error fetching consumed meals:', message)
        } finally {
            setLoading(false)
        }
    }, [targetDate])

    useEffect(() => {
        fetchConsumedMeals()
    }, [fetchConsumedMeals])

    const addConsumedMeal = useCallback(async (mealData: ConsumedMealData): Promise<boolean> => {
        try {
            setError(null)
            const response = await fetch('/api/consumed-meals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mealData),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to add consumed meal')
            }

            const data = await response.json()
            if (data.success) {
                // Refresh the list
                await fetchConsumedMeals()
                return true
            }
            return false
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(message)
            console.error('Error adding consumed meal:', message)
            return false
        }
    }, [fetchConsumedMeals])

    const removeConsumedMeal = useCallback(async (mealId: string): Promise<boolean> => {
        try {
            setError(null)
            const response = await fetch(`/api/consumed-meals?id=${mealId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to remove consumed meal')
            }

            const data = await response.json()
            if (data.success) {
                // Refresh the list
                await fetchConsumedMeals()
                return true
            }
            return false
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(message)
            console.error('Error removing consumed meal:', message)
            return false
        }
    }, [fetchConsumedMeals])

    const getConsumedCount = useCallback((mealName: string): number => {
        return consumedCounts[mealName] || 0
    }, [consumedCounts])

    return {
        consumedMeals,
        consumedCounts,
        loading,
        error,
        addConsumedMeal,
        removeConsumedMeal,
        getConsumedCount,
        refreshConsumedMeals: fetchConsumedMeals,
    }
}

