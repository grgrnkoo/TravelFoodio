// Re-export Supabase types
export * from './supabase'

// User Types (compatible with existing code)
export interface IUserMeal {
    name: string;
    dateLastUpdated: Date | string;
}

export interface IUserIngredient {
    name: string;
    rating: number;
    dateLastUpdated: Date | string;
}

export interface IUserCuisine {
    name: string;
    rating: number;
    dateLastUpdated: Date | string;
}

// IUser interface for backwards compatibility with existing components
// This combines the user core data with preferences
export interface IUser {
    id: string;
    _id?: string; // Alias for backwards compatibility
    clerkUserId: string;
    email: string;
    image?: string;
    name?: string;
    age?: number;
    location?: string;
    dailyCaloriesSuggested?: number;
    goals?: string;
    dietaryRestrictions?: string;
    favoriteMeals: IUserMeal[];
    dislikedMeals: IUserMeal[];
    ingredients: IUserIngredient[];
    cuisines: IUserCuisine[];
    updatesRemaining: number;
    subscriptionType: string;
    onboardingCompleted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// Lightweight user type without preferences (for initial load)
export interface IUserCore {
    id: string;
    clerkUserId: string;
    email: string;
    image?: string;
    name?: string;
    age?: number;
    location?: string;
    dailyCaloriesSuggested?: number;
    goals?: string;
    dietaryRestrictions?: string;
    updatesRemaining: number;
    subscriptionType: string;
    onboardingCompleted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// Meal Types
export interface IMeal {
    id?: string;
    name: string;
    description?: string;
    cuisine?: string;
    ingredients?: string[];
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    weight?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// Menu Types
export interface IMenu {
    id: string;
    userId: string;
    meals: IMeal[];
    createdAt: Date | string;
    expiresAt?: Date | string;
}

// Preferences Types
export interface IPreferences {
    userId: string;
    favoriteMeals: IUserMeal[];
    dislikedMeals: IUserMeal[];
    ingredients: IUserIngredient[];
    cuisines: IUserCuisine[];
}

// Feedback Types
export interface IFeedback {
    id?: string;
    userId?: string;
    author?: string;
    email?: string;
    message?: string;
    feedback?: string;
    rating?: number;
    isPublic?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// Popup Types
export type PopupType = 'success' | 'error' | 'info';

// Total Nutrition Types
export interface TotalNutrition {
    name: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Menu Generation Types
export interface GenerateMenuRequest {
    preferences?: string;
    dietaryRestrictions?: string;
    calories?: number;
}

export interface GenerateMenuResponse {
    meals: Array<{
        name: string;
        description: string;
        ingredients: string[];
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>;
}
