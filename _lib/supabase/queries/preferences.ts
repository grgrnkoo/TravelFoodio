import { getSupabaseServerClient } from '../server'
import type { IUserMeal, IUserIngredient, IUserCuisine } from '../../../types'

const supabase = getSupabaseServerClient()

// Get all preferences for a user
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

// Add a favorite meal
export async function addFavoriteMeal(userId: string, mealName: string): Promise<boolean> {
    const { error } = await supabase
        .from('user_favorite_meals')
        .upsert({
            user_id: userId,
            meal_name: mealName,
        }, {
            onConflict: 'user_id,meal_name',
        })

    if (error) {
        console.error('[addFavoriteMeal] Error:', error.message)
        return false
    }

    return true
}

// Remove a favorite meal
export async function removeFavoriteMeal(userId: string, mealName: string): Promise<boolean> {
    const { error } = await supabase
        .from('user_favorite_meals')
        .delete()
        .eq('user_id', userId)
        .eq('meal_name', mealName)

    if (error) {
        console.error('[removeFavoriteMeal] Error:', error.message)
        return false
    }

    return true
}

// Add a disliked meal
export async function addDislikedMeal(userId: string, mealName: string): Promise<boolean> {
    const { error } = await supabase
        .from('user_disliked_meals')
        .upsert({
            user_id: userId,
            meal_name: mealName,
        }, {
            onConflict: 'user_id,meal_name',
        })

    if (error) {
        console.error('[addDislikedMeal] Error:', error.message)
        return false
    }

    return true
}

// Remove a disliked meal
export async function removeDislikedMeal(userId: string, mealName: string): Promise<boolean> {
    const { error } = await supabase
        .from('user_disliked_meals')
        .delete()
        .eq('user_id', userId)
        .eq('meal_name', mealName)

    if (error) {
        console.error('[removeDislikedMeal] Error:', error.message)
        return false
    }

    return true
}

// Upsert ingredient rating (adds delta to current rating)
export async function updateIngredientRating(
    userId: string,
    ingredientName: string,
    ratingDelta: number
): Promise<boolean> {
    // First check if ingredient exists
    const { data: existing } = await supabase
        .from('user_ingredients')
        .select('rating')
        .eq('user_id', userId)
        .eq('ingredient_name', ingredientName)
        .single()

    const newRating = (existing?.rating || 0) + ratingDelta

    const { error } = await supabase
        .from('user_ingredients')
        .upsert({
            user_id: userId,
            ingredient_name: ingredientName,
            rating: newRating,
        }, {
            onConflict: 'user_id,ingredient_name',
        })

    if (error) {
        console.error('[updateIngredientRating] Error:', error.message)
        return false
    }

    return true
}

// Upsert cuisine rating (adds delta to current rating)
export async function updateCuisineRating(
    userId: string,
    cuisineName: string,
    ratingDelta: number
): Promise<boolean> {
    // First check if cuisine exists
    const { data: existing } = await supabase
        .from('user_cuisines')
        .select('rating')
        .eq('user_id', userId)
        .eq('cuisine_name', cuisineName)
        .single()

    const newRating = (existing?.rating || 0) + ratingDelta

    const { error } = await supabase
        .from('user_cuisines')
        .upsert({
            user_id: userId,
            cuisine_name: cuisineName,
            rating: newRating,
        }, {
            onConflict: 'user_id,cuisine_name',
        })

    if (error) {
        console.error('[updateCuisineRating] Error:', error.message)
        return false
    }

    return true
}

// Check if a meal is liked
export async function isMealLiked(userId: string, mealName: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('user_favorite_meals')
        .select('id')
        .eq('user_id', userId)
        .eq('meal_name', mealName)
        .single()

    return !error && !!data
}

// Check if a meal is disliked
export async function isMealDisliked(userId: string, mealName: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('user_disliked_meals')
        .select('id')
        .eq('user_id', userId)
        .eq('meal_name', mealName)
        .single()

    return !error && !!data
}

// Handle like/dislike action for a meal (full logic)
export async function handleMealPreference(
    userId: string,
    meal: {
        name: string
        ingredients?: string[]
        cuisine?: string
    },
    action: 'like' | 'dislike'
): Promise<{ success: boolean; error?: string }> {
    try {
        const mealName = meal.name
        const isCurrentlyLiked = await isMealLiked(userId, mealName)
        const isCurrentlyDisliked = await isMealDisliked(userId, mealName)

        if (action === 'like') {
            if (isCurrentlyLiked) {
                // Unlike: remove from favorites
                await removeFavoriteMeal(userId, mealName)
                // Decrease ratings
                if (meal.ingredients) {
                    for (const ing of meal.ingredients) {
                        await updateIngredientRating(userId, ing, -1)
                    }
                }
                if (meal.cuisine) {
                    await updateCuisineRating(userId, meal.cuisine, -1)
                }
            } else {
                // Like: add to favorites, remove from dislikes
                await addFavoriteMeal(userId, mealName)
                await removeDislikedMeal(userId, mealName)
                
                // Calculate rating change
                let ratingChange = 1
                if (isCurrentlyDisliked) {
                    ratingChange = 2 // Was disliked, now liked (+2 swing)
                }

                // Boost ratings
                if (meal.ingredients) {
                    for (const ing of meal.ingredients) {
                        await updateIngredientRating(userId, ing, ratingChange)
                    }
                }
                if (meal.cuisine) {
                    await updateCuisineRating(userId, meal.cuisine, ratingChange)
                }
            }
        } else if (action === 'dislike') {
            if (isCurrentlyDisliked) {
                // Undislike: remove from dislikes
                await removeDislikedMeal(userId, mealName)
                // Increase ratings
                if (meal.ingredients) {
                    for (const ing of meal.ingredients) {
                        await updateIngredientRating(userId, ing, 1)
                    }
                }
                if (meal.cuisine) {
                    await updateCuisineRating(userId, meal.cuisine, 1)
                }
            } else {
                // Dislike: add to dislikes, remove from favorites
                await addDislikedMeal(userId, mealName)
                await removeFavoriteMeal(userId, mealName)

                // Calculate rating change
                let ratingChange = -1
                if (isCurrentlyLiked) {
                    ratingChange = -2 // Was liked, now disliked (-2 swing)
                }

                // Lower ratings
                if (meal.ingredients) {
                    for (const ing of meal.ingredients) {
                        await updateIngredientRating(userId, ing, ratingChange)
                    }
                }
                if (meal.cuisine) {
                    await updateCuisineRating(userId, meal.cuisine, ratingChange)
                }
            }
        }

        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[handleMealPreference] Error:', message)
        return { success: false, error: message }
    }
}

// Bulk update preferences (for onboarding or preferences page)
export async function bulkUpdatePreferences(
    userId: string,
    preferences: {
        favoriteMeals?: Array<{ name: string }>
        dislikedMeals?: Array<{ name: string }>
        ingredients?: Array<{ name: string; rating: number }>
        cuisines?: Array<{ name: string; rating: number }>
    }
): Promise<boolean> {
    try {
        // Clear existing and insert new favorites
        if (preferences.favoriteMeals) {
            await supabase.from('user_favorite_meals').delete().eq('user_id', userId)
            if (preferences.favoriteMeals.length > 0) {
                await supabase.from('user_favorite_meals').insert(
                    preferences.favoriteMeals.map(m => ({
                        user_id: userId,
                        meal_name: m.name,
                    }))
                )
            }
        }

        // Clear existing and insert new dislikes
        if (preferences.dislikedMeals) {
            await supabase.from('user_disliked_meals').delete().eq('user_id', userId)
            if (preferences.dislikedMeals.length > 0) {
                await supabase.from('user_disliked_meals').insert(
                    preferences.dislikedMeals.map(m => ({
                        user_id: userId,
                        meal_name: m.name,
                    }))
                )
            }
        }

        // Clear existing and insert new ingredients
        if (preferences.ingredients) {
            await supabase.from('user_ingredients').delete().eq('user_id', userId)
            if (preferences.ingredients.length > 0) {
                await supabase.from('user_ingredients').insert(
                    preferences.ingredients.map(i => ({
                        user_id: userId,
                        ingredient_name: i.name,
                        rating: i.rating,
                    }))
                )
            }
        }

        // Clear existing and insert new cuisines
        if (preferences.cuisines) {
            await supabase.from('user_cuisines').delete().eq('user_id', userId)
            if (preferences.cuisines.length > 0) {
                await supabase.from('user_cuisines').insert(
                    preferences.cuisines.map(c => ({
                        user_id: userId,
                        cuisine_name: c.name,
                        rating: c.rating,
                    }))
                )
            }
        }

        return true
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[bulkUpdatePreferences] Error:', message)
        return false
    }
}

