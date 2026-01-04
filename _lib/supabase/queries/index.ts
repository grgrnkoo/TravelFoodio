// Re-export all query functions for convenience
export * from './users'
export * from './menus'
// Preferences is re-exported with a rename to avoid conflict with users
export { 
    getUserPreferences as getPreferences,
    addFavoriteMeal,
    removeFavoriteMeal,
    addDislikedMeal,
    removeDislikedMeal,
    updateIngredientRating,
    updateCuisineRating,
    isMealLiked,
    isMealDisliked,
    handleMealPreference,
    bulkUpdatePreferences
} from './preferences'
export * from './feedback'

