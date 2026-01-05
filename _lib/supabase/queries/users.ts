import { getSupabaseServerClient } from '../server'
import { clerkClient } from '@clerk/nextjs/server'
import type { IUser, IUserCore, IUserMeal, IUserIngredient, IUserCuisine } from '../../../types'
import type { UserInsert, UserUpdate } from '../../../types/supabase'
import { getUserMenuPreferences } from './preferences'

const supabase = getSupabaseServerClient()

// Transform Supabase user row to IUserCore
function transformToUserCore(row: Record<string, unknown>): IUserCore {
    return {
        id: row.id as string,
        clerkUserId: row.clerk_user_id as string,
        email: row.email as string,
        image: row.image as string | undefined,
        name: row.name as string | undefined,
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
        // Don't log PGRST116 (no rows) as an error - it's expected for new users
        if (error?.code !== 'PGRST116') {
            console.error('[getUserByClerkId] Error:', error?.message)
        }
        return null
    }

    return transformToUserCore(data)
}

// Ensures user exists in DB, syncs from Clerk if missing (lazy sync)
export async function ensureUserExists(clerkUserId: string): Promise<IUserCore | null> {
    // First, try to get from DB (most common case - no extra requests)
    const existingUser = await getUserByClerkId(clerkUserId)
    if (existingUser) {
        return existingUser
    }

    // User not in DB - fetch from Clerk and create (rare fallback)
    console.log('[ensureUserExists] User not in DB, syncing from Clerk:', clerkUserId)
    
    try {
        const clerk = await clerkClient()
        const clerkUser = await clerk.users.getUser(clerkUserId)
        
        if (!clerkUser) {
            console.error('[ensureUserExists] User not found in Clerk:', clerkUserId)
            return null
        }

        const primaryEmail = clerkUser.emailAddresses?.find(
            e => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress

        if (!primaryEmail) {
            console.error('[ensureUserExists] No primary email found for Clerk user:', clerkUserId)
            return null
        }

        // Create user in DB
        const newUser = await createUser({
            clerkUserId,
            email: primaryEmail,
            name: clerkUser.firstName && clerkUser.lastName 
                ? `${clerkUser.firstName} ${clerkUser.lastName}` 
                : clerkUser.firstName || '',
            image: clerkUser.imageUrl || '',
            onboardingCompleted: false,
        })

        if (newUser) {
            console.log('[ensureUserExists] User synced successfully:', primaryEmail)
        }

        return newUser
    } catch (error) {
        console.error('[ensureUserExists] Error syncing from Clerk:', error)
        return null
    }
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
    const [menuPreferences, favoriteMeals, dislikedMeals, ingredients, cuisines] = await Promise.all([
        getUserMenuPreferences(userId),
        supabase.from('user_favorite_meals').select('*').eq('user_id', userId),
        supabase.from('user_disliked_meals').select('*').eq('user_id', userId),
        supabase.from('user_ingredients').select('*').eq('user_id', userId),
        supabase.from('user_cuisines').select('*').eq('user_id', userId),
    ])

    const result: IUser = {
        id: userData.id,
        _id: userData.id, // Backwards compatibility
        clerkUserId: userData.clerk_user_id,
        email: userData.email,
        image: userData.image || undefined,
        name: userData.name || undefined,
        preferences: menuPreferences || undefined,
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

    // Add legacy fields for backwards compatibility
    if (menuPreferences) {
        result.age = menuPreferences.age
        result.location = menuPreferences.location
        result.dailyCaloriesSuggested = menuPreferences.dailyCaloriesSuggested
        result.goals = menuPreferences.goals
        result.dietaryRestrictions = menuPreferences.dietaryRestrictions
    }

    return result
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
        updatesRemaining: number
        subscriptionType: string
        onboardingCompleted: boolean
    }>
): Promise<IUserCore | null> {
    const updateData: UserUpdate = {}

    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.image !== undefined) updateData.image = updates.image
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

    // Map camelCase to snake_case (only core user fields)
    const fieldMap: Record<string, keyof UserUpdate> = {
        email: 'email',
        name: 'name',
        image: 'image',
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

    // Map camelCase to snake_case (only core user fields)
    const fieldMap: Record<string, keyof UserUpdate> = {
        email: 'email',
        name: 'name',
        image: 'image',
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

