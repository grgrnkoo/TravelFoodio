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

// User preferences type (menu generation data)
export interface IUserPreferences {
    id?: string;
    userId: string;
    age?: number;
    dateOfBirth?: Date | string;
    location?: string;
    dailyCaloriesSuggested?: number;
    dailyCarbsSuggested?: number;
    dailyProteinsSuggested?: number;
    dailyFatsSuggested?: number;
    goals?: string;
    dietaryRestrictions?: string;
    medicalRecommendations?: string[];
    weight?: string;
    height?: string;
    otherInfo?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
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
    preferences?: IUserPreferences;
    favoriteMeals: IUserMeal[];
    dislikedMeals: IUserMeal[];
    ingredients: IUserIngredient[];
    cuisines: IUserCuisine[];
    updatesRemaining: number;
    dailyUpdates: number;
    subscriptionType: string;
    onboarding1Completed: boolean;
    onboarding2Completed: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    // Legacy fields for backwards compatibility (deprecated - use preferences)
    age?: number;
    location?: string;
    dailyCaloriesSuggested?: number;
    goals?: string;
    dietaryRestrictions?: string;
}

// Aggregated profile used specifically for menu generation prompts
export interface FullUserProfileForGeneration {
    user: IUserCore;
    preferences?: IUserPreferences;
    favoriteMeals: IUserMeal[];
    dislikedMeals: IUserMeal[];
    ingredients: IUserIngredient[];
    cuisines: IUserCuisine[];
}

// Lightweight user type without preferences (for initial load)
export interface IUserCore {
    id: string;
    clerkUserId: string;
    email: string;
    image?: string;
    name?: string;
    updatesRemaining: number;
    dailyUpdates: number;
    subscriptionType: string;
    onboarding1Completed: boolean;
    onboarding2Completed: boolean;
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

// Consumed Meal Types
export interface IConsumedMeal {
    id: string;
    userId: string;
    mealName: string;
    calories?: number;
    protein?: number;
    fats?: number;
    carbs?: number;
    weight?: number;
    cuisine?: string;
    ingredients?: string[];
    consumedAt: Date | string;
    consumedDate: Date | string;
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

// Error Log Types
export interface IErrorLog {
    id: string;
    userId?: string;
    errorType: string;
    errorMessage: string;
    errorStack?: string;
    endpoint?: string;
    requestData?: Record<string, unknown>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
    createdAt: Date | string;
}
