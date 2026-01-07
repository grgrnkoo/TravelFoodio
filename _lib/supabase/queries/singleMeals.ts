import { getSupabaseServerClient } from '../server'
import type { IMeal } from '../../../types'

const supabase = getSupabaseServerClient()

interface SingleMealData {
    name: string
    calories?: number
    protein?: number
    fats?: number
    carbs?: number
    weight?: number
    cuisine?: string
    ingredients?: string[]
    source: 'photo' | 'prompt'
}

// Save a single meal
export async function saveSingleMeal(
    userId: string,
    mealData: SingleMealData
): Promise<IMeal | null> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('single_meals')
        .insert({
            user_id: userId,
            name: mealData.name,
            calories: mealData.calories ?? null,
            protein: mealData.protein ?? null,
            fats: mealData.fats ?? null,
            carbs: mealData.carbs ?? null,
            weight: mealData.weight ?? null,
            cuisine: mealData.cuisine ?? null,
            ingredients: mealData.ingredients || [],
            source: mealData.source,
            generation_date: today,
        })
        .select()
        .single()

    if (error) {
        console.error('[saveSingleMeal] Error:', error.message)
        return null
    }

    return {
        id: data.id,
        name: data.name,
        calories: data.calories ?? undefined,
        protein: data.protein ?? undefined,
        fats: data.fats ?? undefined,
        carbs: data.carbs ?? undefined,
        weight: data.weight ?? undefined,
        cuisine: data.cuisine ?? undefined,
        ingredients: Array.isArray(data.ingredients) ? (data.ingredients as string[]) : [],
        createdAt: data.created_at,
    }
}

// Get single meals for a user on a specific date, optionally filtered by source
export async function getSingleMealsByDate(
    userId: string,
    date: Date,
    source?: 'photo' | 'prompt'
): Promise<IMeal[]> {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dateString = date.toISOString().split('T')[0]

    let query = supabase
        .from('single_meals')
        .select('*')
        .eq('user_id', userId)
        .eq('generation_date', dateString)
        .order('created_at', { ascending: false })

    if (source) {
        query = query.eq('source', source)
    }

    const { data, error } = await query

    if (error) {
        console.error('[getSingleMealsByDate] Error:', error.message)
        return []
    }

    if (!data) {
        return []
    }

    return data.map(m => ({
        id: m.id,
        name: m.name,
        calories: m.calories ?? undefined,
        protein: m.protein ?? undefined,
        fats: m.fats ?? undefined,
        carbs: m.carbs ?? undefined,
        weight: m.weight ?? undefined,
        cuisine: m.cuisine ?? undefined,
        ingredients: Array.isArray(m.ingredients) ? (m.ingredients as string[]) : [],
        createdAt: m.created_at,
    }))
}

// Get single meals for a date range (for future use)
export async function getSingleMealsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    source?: 'photo' | 'prompt'
): Promise<IMeal[]> {
    const startDateString = startDate.toISOString().split('T')[0]
    const endDateString = endDate.toISOString().split('T')[0]

    let query = supabase
        .from('single_meals')
        .select('*')
        .eq('user_id', userId)
        .gte('generation_date', startDateString)
        .lte('generation_date', endDateString)
        .order('created_at', { ascending: false })

    if (source) {
        query = query.eq('source', source)
    }

    const { data, error } = await query

    if (error) {
        console.error('[getSingleMealsByDateRange] Error:', error.message)
        return []
    }

    if (!data) {
        return []
    }

    return data.map(m => ({
        id: m.id,
        name: m.name,
        calories: m.calories ?? undefined,
        protein: m.protein ?? undefined,
        fats: m.fats ?? undefined,
        carbs: m.carbs ?? undefined,
        weight: m.weight ?? undefined,
        cuisine: m.cuisine ?? undefined,
        ingredients: Array.isArray(m.ingredients) ? (m.ingredients as string[]) : [],
        createdAt: m.created_at,
    }))
}

// Get single meals by names for a specific user (for favorite/disliked meals)
export async function getSingleMealsByNames(
    userId: string,
    names: string[]
): Promise<IMeal[]> {
    if (names.length === 0) {
        return []
    }

    const { data, error } = await supabase
        .from('single_meals')
        .select('*')
        .eq('user_id', userId)
        .in('name', names)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[getSingleMealsByNames] Error:', error.message)
        return []
    }

    if (!data) {
        return []
    }

    return data.map(m => ({
        id: m.id,
        name: m.name,
        calories: m.calories ?? undefined,
        protein: m.protein ?? undefined,
        fats: m.fats ?? undefined,
        carbs: m.carbs ?? undefined,
        weight: m.weight ?? undefined,
        cuisine: m.cuisine ?? undefined,
        ingredients: Array.isArray(m.ingredients) ? (m.ingredients as string[]) : [],
        createdAt: m.created_at,
    }))
}

