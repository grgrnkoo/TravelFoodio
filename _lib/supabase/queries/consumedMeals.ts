import { getSupabaseServerClient } from '../server'
import type { IConsumedMeal } from '../../../types'

const supabase = getSupabaseServerClient()

// Add a consumed meal
export async function addConsumedMeal(
    userId: string,
    mealData: {
        mealName: string
        calories?: number
        protein?: number
        fats?: number
        carbs?: number
        weight?: number
        cuisine?: string
        ingredients?: string[]
    }
): Promise<IConsumedMeal | null> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('consumed_meals')
        .insert({
            user_id: userId,
            meal_name: mealData.mealName,
            calories: mealData.calories ?? null,
            protein: mealData.protein ?? null,
            fats: mealData.fats ?? null,
            carbs: mealData.carbs ?? null,
            weight: mealData.weight ?? null,
            cuisine: mealData.cuisine ?? null,
            ingredients: mealData.ingredients ?? [],
            consumed_date: today,
        })
        .select()
        .single()

    if (error) {
        console.error('[addConsumedMeal] Error:', error.message)
        return null
    }

    return {
        id: data.id,
        userId: data.user_id,
        mealName: data.meal_name,
        calories: data.calories ?? undefined,
        protein: data.protein ?? undefined,
        fats: data.fats ?? undefined,
        carbs: data.carbs ?? undefined,
        weight: data.weight ?? undefined,
        cuisine: data.cuisine ?? undefined,
        ingredients: Array.isArray(data.ingredients) ? (data.ingredients as string[]) : [],
        consumedAt: data.consumed_at,
        consumedDate: data.consumed_date,
    }
}

// Get consumed meals count for a specific meal name on a date (for 10-per-day limit)
export async function getConsumedMealsCount(
    userId: string,
    mealName: string,
    date: string
): Promise<number> {
    const { count, error } = await supabase
        .from('consumed_meals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('meal_name', mealName)
        .eq('consumed_date', date)

    if (error) {
        console.error('[getConsumedMealsCount] Error:', error.message)
        return 0
    }

    return count || 0
}

// Get consumed meals for a specific date
export async function getConsumedMealsByDate(
    userId: string,
    date: string
): Promise<IConsumedMeal[]> {
    const { data, error } = await supabase
        .from('consumed_meals')
        .select('*')
        .eq('user_id', userId)
        .eq('consumed_date', date)
        .order('consumed_at', { ascending: false })

    if (error) {
        console.error('[getConsumedMealsByDate] Error:', error.message)
        return []
    }

    return (data || []).map(meal => ({
        id: meal.id,
        userId: meal.user_id,
        mealName: meal.meal_name,
        calories: meal.calories ?? undefined,
        protein: meal.protein ?? undefined,
        fats: meal.fats ?? undefined,
        carbs: meal.carbs ?? undefined,
        weight: meal.weight ?? undefined,
        cuisine: meal.cuisine ?? undefined,
        ingredients: Array.isArray(meal.ingredients) ? (meal.ingredients as string[]) : [],
        consumedAt: meal.consumed_at,
        consumedDate: meal.consumed_date,
    }))
}

// Remove a consumed meal
export async function removeConsumedMeal(
    userId: string,
    mealId: string
): Promise<boolean> {
    const { error } = await supabase
        .from('consumed_meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId)

    if (error) {
        console.error('[removeConsumedMeal] Error:', error.message)
        return false
    }

    return true
}

// Get daily nutrition totals for a specific date
export async function getDailyNutritionTotals(
    userId: string,
    date: string
): Promise<{
    calories: number
    protein: number
    fats: number
    carbs: number
}> {
    const { data, error } = await supabase
        .from('consumed_meals')
        .select('calories, protein, fats, carbs')
        .eq('user_id', userId)
        .eq('consumed_date', date)

    if (error) {
        console.error('[getDailyNutritionTotals] Error:', error.message)
        return { calories: 0, protein: 0, fats: 0, carbs: 0 }
    }

    const totals = (data || []).reduce<{
        calories: number
        protein: number
        fats: number
        carbs: number
    }>(
        (acc, meal) => ({
            calories: (acc.calories ?? 0) + (meal.calories ?? 0),
            protein: (acc.protein ?? 0) + (meal.protein ?? 0),
            fats: (acc.fats ?? 0) + (meal.fats ?? 0),
            carbs: (acc.carbs ?? 0) + (meal.carbs ?? 0),
        }),
        { calories: 0, protein: 0, fats: 0, carbs: 0 }
    )

    return totals
}

