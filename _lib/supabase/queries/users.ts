import { getSupabaseServerClient } from '../server'
import type { IUser, IUserCore, IUserMeal, IUserIngredient, IUserCuisine } from '../../../types'
import type { UserInsert, UserUpdate } from '../../../types/supabase'

const supabase = getSupabaseServerClient()

// Transform Supabase user row to IUserCore
function transformToUserCore(row: Record<string, unknown>): IUserCore {
    return {
        id: row.id as string,
        clerkUserId: row.clerk_user_id as string,
        email: row.email as string,
        image: row.image as string | undefined,
        name: row.name as string | undefined,
        age: row.age as number | undefined,
        location: row.location as string | undefined,
        dailyCaloriesSuggested: row.daily_calories_suggested as number | undefined,
        goals: row.goals as string | undefined,
        dietaryRestrictions: row.dietary_restrictions as string | undefined,
        updatesRemaining: row.updates_remaining as number,
        subscriptionType: row.subscription_type as string,
        onboardingCompleted: row.onboarding_completed as boolean,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    }
}

// Get user by Clerk ID (lightweight - core data only)
export async function getUserByClerkId(clerkUserId: string): Promise<IUserCore | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single()

    if (error || !data) {
        console.error('[getUserByClerkId] Error:', error?.message)
        return null
    }

    return transformToUserCore(data)
}

// Get user by email (lightweight - core data only)
export async function getUserByEmail(email: string): Promise<IUserCore | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

    if (error || !data) {
        console.error('[getUserByEmail] Error:', error?.message)
        return null
    }

    return transformToUserCore(data)
}

// Get user by ID
export async function getUserById(userId: string): Promise<IUserCore | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (error || !data) {
        console.error('[getUserById] Error:', error?.message)
        return null
    }

    return transformToUserCore(data)
}

// Get full user profile with preferences (heavy - use sparingly)
export async function getUserFullProfile(clerkUserId: string): Promise<IUser | null> {
    // Get core user data
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single()

    if (userError || !userData) {
        console.error('[getUserFullProfile] User error:', userError?.message)
        return null
    }

    const userId = userData.id

    // Fetch all preferences in parallel
    const [favoriteMeals, dislikedMeals, ingredients, cuisines] = await Promise.all([
        supabase.from('user_favorite_meals').select('*').eq('user_id', userId),
        supabase.from('user_disliked_meals').select('*').eq('user_id', userId),
        supabase.from('user_ingredients').select('*').eq('user_id', userId),
        supabase.from('user_cuisines').select('*').eq('user_id', userId),
    ])

    return {
        id: userData.id,
        _id: userData.id, // Backwards compatibility
        clerkUserId: userData.clerk_user_id,
        email: userData.email,
        image: userData.image || undefined,
        name: userData.name || undefined,
        age: userData.age || undefined,
        location: userData.location || undefined,
        dailyCaloriesSuggested: userData.daily_calories_suggested || undefined,
        goals: userData.goals || undefined,
        dietaryRestrictions: userData.dietary_restrictions || undefined,
        updatesRemaining: userData.updates_remaining,
        subscriptionType: userData.subscription_type,
        onboardingCompleted: userData.onboarding_completed,
        favoriteMeals: (favoriteMeals.data || []).map(m => ({
            name: m.meal_name,
            dateLastUpdated: m.created_at,
        })),
        dislikedMeals: (dislikedMeals.data || []).map(m => ({
            name: m.meal_name,
            dateLastUpdated: m.created_at,
        })),
        ingredients: (ingredients.data || []).map(i => ({
            name: i.ingredient_name,
            rating: i.rating,
            dateLastUpdated: i.updated_at,
        })),
        cuisines: (cuisines.data || []).map(c => ({
            name: c.cuisine_name,
            rating: c.rating,
            dateLastUpdated: c.updated_at,
        })),
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
    }
}

// Create a new user
export async function createUser(userData: {
    clerkUserId: string
    email: string
    name?: string
    image?: string
    onboardingCompleted?: boolean
}): Promise<IUserCore | null> {
    const insertData: UserInsert = {
        clerk_user_id: userData.clerkUserId,
        email: userData.email,
        name: userData.name || null,
        image: userData.image || null,
        onboarding_completed: userData.onboardingCompleted || false,
    }

    const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single()

    if (error) {
        console.error('[createUser] Error:', error.message)
        return null
    }

    return transformToUserCore(data)
}

// Update user by Clerk ID
export async function updateUserByClerkId(
    clerkUserId: string,
    updates: Partial<{
        email: string
        name: string
        image: string
        age: number
        location: string
        dailyCaloriesSuggested: number
        goals: string
        dietaryRestrictions: string
        updatesRemaining: number
        subscriptionType: string
        onboardingCompleted: boolean
    }>
): Promise<IUserCore | null> {
    const updateData: UserUpdate = {}

    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.image !== undefined) updateData.image = updates.image
    if (updates.age !== undefined) updateData.age = updates.age
    if (updates.location !== undefined) updateData.location = updates.location
    if (updates.dailyCaloriesSuggested !== undefined) updateData.daily_calories_suggested = updates.dailyCaloriesSuggested
    if (updates.goals !== undefined) updateData.goals = updates.goals
    if (updates.dietaryRestrictions !== undefined) updateData.dietary_restrictions = updates.dietaryRestrictions
    if (updates.updatesRemaining !== undefined) updateData.updates_remaining = updates.updatesRemaining
    if (updates.subscriptionType !== undefined) updateData.subscription_type = updates.subscriptionType
    if (updates.onboardingCompleted !== undefined) updateData.onboarding_completed = updates.onboardingCompleted

    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single()

    if (error) {
        console.error('[updateUserByClerkId] Error:', error.message)
        return null
    }

    return transformToUserCore(data)
}

// Update user by email
export async function updateUserByEmail(
    email: string,
    updates: Record<string, unknown>
): Promise<IUserCore | null> {
    const updateData: UserUpdate = {}

    // Map camelCase to snake_case
    const fieldMap: Record<string, keyof UserUpdate> = {
        email: 'email',
        name: 'name',
        image: 'image',
        age: 'age',
        location: 'location',
        dailyCaloriesSuggested: 'daily_calories_suggested',
        goals: 'goals',
        dietaryRestrictions: 'dietary_restrictions',
        updatesRemaining: 'updates_remaining',
        subscriptionType: 'subscription_type',
        onboardingCompleted: 'onboarding_completed',
    }

    for (const [key, value] of Object.entries(updates)) {
        const snakeKey = fieldMap[key]
        if (snakeKey && value !== undefined) {
            (updateData as Record<string, unknown>)[snakeKey] = value
        }
    }

    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('email', email)
        .select()
        .single()

    if (error) {
        console.error('[updateUserByEmail] Error:', error.message)
        return null
    }

    return transformToUserCore(data)
}

// Update user by ID
export async function updateUserById(
    userId: string,
    updates: Record<string, unknown>
): Promise<IUserCore | null> {
    const updateData: UserUpdate = {}

    // Map camelCase to snake_case
    const fieldMap: Record<string, keyof UserUpdate> = {
        email: 'email',
        name: 'name',
        image: 'image',
        age: 'age',
        location: 'location',
        dailyCaloriesSuggested: 'daily_calories_suggested',
        goals: 'goals',
        dietaryRestrictions: 'dietary_restrictions',
        updatesRemaining: 'updates_remaining',
        subscriptionType: 'subscription_type',
        onboardingCompleted: 'onboarding_completed',
    }

    for (const [key, value] of Object.entries(updates)) {
        const snakeKey = fieldMap[key]
        if (snakeKey && value !== undefined) {
            (updateData as Record<string, unknown>)[snakeKey] = value
        }
    }

    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('[updateUserById] Error:', error.message)
        return null
    }

    return transformToUserCore(data)
}

// Update only updatesRemaining field
export async function updateUserUpdatesRemaining(
    userId: string,
    newCount: number
): Promise<{ success: boolean; updatesRemaining: number }> {
    const { data, error } = await supabase
        .from('users')
        .update({ updates_remaining: newCount })
        .eq('id', userId)
        .select('updates_remaining')
        .single()

    if (error) {
        console.error('[updateUserUpdatesRemaining] Error:', error.message)
        return { success: false, updatesRemaining: 0 }
    }

    return { success: true, updatesRemaining: data.updates_remaining }
}

// Get user preferences only (for preferences page)
export async function getUserPreferences(userId: string): Promise<{
    favoriteMeals: IUserMeal[]
    dislikedMeals: IUserMeal[]
    ingredients: IUserIngredient[]
    cuisines: IUserCuisine[]
} | null> {
    const [favoriteMeals, dislikedMeals, ingredients, cuisines] = await Promise.all([
        supabase.from('user_favorite_meals').select('*').eq('user_id', userId),
        supabase.from('user_disliked_meals').select('*').eq('user_id', userId),
        supabase.from('user_ingredients').select('*').eq('user_id', userId),
        supabase.from('user_cuisines').select('*').eq('user_id', userId),
    ])

    return {
        favoriteMeals: (favoriteMeals.data || []).map(m => ({
            name: m.meal_name,
            dateLastUpdated: m.created_at,
        })),
        dislikedMeals: (dislikedMeals.data || []).map(m => ({
            name: m.meal_name,
            dateLastUpdated: m.created_at,
        })),
        ingredients: (ingredients.data || []).map(i => ({
            name: i.ingredient_name,
            rating: i.rating,
            dateLastUpdated: i.updated_at,
        })),
        cuisines: (cuisines.data || []).map(c => ({
            name: c.cuisine_name,
            rating: c.rating,
            dateLastUpdated: c.updated_at,
        })),
    }
}

