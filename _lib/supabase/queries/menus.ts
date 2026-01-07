import { getSupabaseServerClient } from '../server'
import type { IMeal } from '../../../types'
import { getSingleMealsByNames } from './singleMeals'

const supabase = getSupabaseServerClient()

interface MenuMealData {
    name: string
    calories?: number
    protein?: number
    fats?: number
    carbs?: number
    weight?: number
    cuisine?: string
    ingredients?: string[]
    orderIndex?: number
}

// Get menu for a user on a specific date
export async function getMenuByDate(
    userId: string,
    date: Date
): Promise<{ id: string; meals: IMeal[]; createdAt: string } | null> {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const { data: menu, error } = await supabase
        .from('menus')
        .select(`
            id,
            created_at,
            menu_meals (
                id,
                name,
                calories,
                protein,
                fats,
                carbs,
                weight,
                cuisine,
                ingredients,
                order_index
            )
        `)
        .eq('user_id', userId)
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error || !menu) {
        if (error?.code !== 'PGRST116') { // Not "no rows returned"
            console.error('[getMenuByDate] Error:', error?.message)
        }
        return null
    }

    const meals = ((menu.menu_meals as unknown as Array<{
        id: string
        name: string
        calories: number | null
        protein: number | null
        fats: number | null
        carbs: number | null
        weight: number | null
        cuisine: string | null
        ingredients: unknown
        order_index: number
    }>) || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(m => ({
            id: m.id,
            name: m.name,
            calories: m.calories || undefined,
            protein: m.protein || undefined,
            fats: m.fats || undefined,
            carbs: m.carbs || undefined,
            weight: m.weight || undefined,
            cuisine: m.cuisine || undefined,
            ingredients: Array.isArray(m.ingredients) ? m.ingredients as string[] : [],
        }))

    return {
        id: menu.id,
        meals,
        createdAt: menu.created_at,
    }
}

// Get today's menu for a user
export async function getTodaysMenu(userId: string): Promise<{ id: string; meals: IMeal[]; createdAt: string } | null> {
    return getMenuByDate(userId, new Date())
}

// Check if a menu exists for today
export async function menuExistsForToday(userId: string): Promise<boolean> {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
        .from('menus')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString())

    if (error) {
        console.error('[menuExistsForToday] Error:', error.message)
        return false
    }

    return (count || 0) > 0
}

// Create a new menu with meals
export async function createMenu(
    userId: string,
    meals: MenuMealData[]
): Promise<{ id: string; meals: IMeal[]; createdAt: string } | null> {
    // Create the menu
    const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert({ user_id: userId })
        .select()
        .single()

    if (menuError || !menu) {
        console.error('[createMenu] Error creating menu:', menuError?.message)
        return null
    }

    // Insert all meals
    const mealsToInsert = meals.map((meal, index) => ({
        menu_id: menu.id,
        name: meal.name,
        calories: meal.calories || null,
        protein: meal.protein || null,
        fats: meal.fats || null,
        carbs: meal.carbs || null,
        weight: meal.weight || null,
        cuisine: meal.cuisine || null,
        ingredients: meal.ingredients || [],
        order_index: meal.orderIndex ?? index,
    }))

    const { data: insertedMeals, error: mealsError } = await supabase
        .from('menu_meals')
        .insert(mealsToInsert)
        .select()

    if (mealsError) {
        console.error('[createMenu] Error inserting meals:', mealsError.message)
        // Clean up the menu if meals failed
        await supabase.from('menus').delete().eq('id', menu.id)
        return null
    }

    return {
        id: menu.id,
        meals: (insertedMeals || []).map(m => ({
            id: m.id,
            name: m.name,
            calories: m.calories || undefined,
            protein: m.protein || undefined,
            fats: m.fats || undefined,
            carbs: m.carbs || undefined,
            weight: m.weight || undefined,
            cuisine: m.cuisine || undefined,
            ingredients: Array.isArray(m.ingredients) ? m.ingredients as string[] : [],
        })),
        createdAt: menu.created_at,
    }
}

// Delete today's menu for a user
export async function deleteTodaysMenu(userId: string): Promise<boolean> {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { error } = await supabase
        .from('menus')
        .delete()
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString())

    if (error) {
        console.error('[deleteTodaysMenu] Error:', error.message)
        return false
    }

    return true
}

// Add a single meal to an existing menu
export async function addMealToMenu(
    menuId: string,
    meal: MenuMealData
): Promise<IMeal | null> {
    // Get current max order_index
    const { data: existing } = await supabase
        .from('menu_meals')
        .select('order_index')
        .eq('menu_id', menuId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

    const nextIndex = (existing?.order_index ?? -1) + 1

    const { data: insertedMeal, error } = await supabase
        .from('menu_meals')
        .insert({
            menu_id: menuId,
            name: meal.name,
            calories: meal.calories || null,
            protein: meal.protein || null,
            fats: meal.fats || null,
            carbs: meal.carbs || null,
            weight: meal.weight || null,
            cuisine: meal.cuisine || null,
            ingredients: meal.ingredients || [],
            order_index: meal.orderIndex ?? nextIndex,
        })
        .select()
        .single()

    if (error || !insertedMeal) {
        console.error('[addMealToMenu] Error:', error?.message)
        return null
    }

    return {
        id: insertedMeal.id,
        name: insertedMeal.name,
        calories: insertedMeal.calories || undefined,
        protein: insertedMeal.protein || undefined,
        fats: insertedMeal.fats || undefined,
        carbs: insertedMeal.carbs || undefined,
        weight: insertedMeal.weight || undefined,
        cuisine: insertedMeal.cuisine || undefined,
        ingredients: Array.isArray(insertedMeal.ingredients) ? insertedMeal.ingredients as string[] : [],
    }
}

// Add meal to global meals catalog (upsert)
export async function upsertMealToCatalog(meal: {
    name: string
    cuisine?: string
    ingredients?: string[]
    calories?: number
    weight?: number
    protein?: number
    fats?: number
    carbs?: number
}): Promise<boolean> {
    const { error } = await supabase
        .from('meals')
        .upsert({
            name: meal.name,
            cuisine: meal.cuisine || null,
            ingredients: meal.ingredients || [],
            calories: meal.calories || null,
            weight: meal.weight || null,
            protein: meal.protein || null,
            fats: meal.fats || null,
            carbs: meal.carbs || null,
        }, {
            onConflict: 'name',
        })

    if (error) {
        console.error('[upsertMealToCatalog] Error:', error.message)
        return false
    }

    return true
}

// Get meals from catalog by name
export async function getMealsFromCatalog(names: string[]): Promise<IMeal[]> {
    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .in('name', names)

    if (error || !data) {
        console.error('[getMealsFromCatalog] Error:', error?.message)
        return []
    }

    return data.map(m => ({
        id: m.id,
        name: m.name,
        cuisine: m.cuisine || undefined,
        ingredients: Array.isArray(m.ingredients) ? m.ingredients as string[] : [],
        calories: m.calories || undefined,
        protein: m.protein || undefined,
        fats: m.fats || undefined,
        carbs: m.carbs || undefined,
        weight: m.weight || undefined,
        createdAt: m.created_at,
    }))
}

// Get favorite meals with full data by looking up in multiple sources
// Strategy: Check meals catalog first (where menu meals are saved), then fallback to single_meals (user-generated meals)
export async function getFavoriteMealsWithData(
    userId: string,
    favoriteMealNames: string[]
): Promise<IMeal[]> {
    if (favoriteMealNames.length === 0) {
        return []
    }

    // Check catalog first - menu meals are automatically saved here via addMealToDb
    const catalogMeals = await getMealsFromCatalog(favoriteMealNames)
    const foundNames = new Set(catalogMeals.map(m => m.name))
    const missingNames = favoriteMealNames.filter(name => !foundNames.has(name))

    // Fallback to single_meals for user-generated meals (photo analysis, single meal generation)
    const singleMeals = missingNames.length > 0
        ? await getSingleMealsByNames(userId, missingNames)
        : []

    // Combine both results, prioritizing catalog meals
    return [...catalogMeals, ...singleMeals]
}

