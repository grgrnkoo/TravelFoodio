export interface Meal {
    name: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
    cuisine: string;
    weight: number;
    ingredients: string[];
    like: boolean;
    dislike: boolean;
}

export interface Menu {
    meals: Meal[];
    calculateTotalNutrition(): {
        name: string;
        calories: number;
        protein: number;
        fats: number;
        carbs: number;
    };
    addMeal(meal: Meal): void;
    toJSON(): {
        menu: {
            meal: string;
            calories: number;
            protein: number;
            fats: number;
            carbs: number;
            cuisine: string;
            weight: number;
            ingredients: string[];
            like: boolean;
            dislike: boolean;
        }[];
    };
}

export interface Ingredient {
    name: string;
    ingredientId: string;
    rating: number;
    dateAdded: string;
    increaseRating(): void;
    decreaseRating(): void;
    getInfo(): {
        name: string;
        ingredientId: string;
        rating: number;
        dateAdded: string;
    };
}

export interface MedicalRecommendation {
    recommendation: string;
}

export interface UserOnboardingData {   
    name: string;
    day: string;
    month: string;
    year: string;
    location: string;
    goal: string;
    dietaryRestrictions: string;
    otherInfo: string;
    weight: string;
    weightUnit: string;
    height: string;
    heightUnit: string;
}

export interface UserOnboardingFormatted {
    name?: string | null;
    formattedDate?: Date;
    dateOfBirthday?: Date;
    location: string;
    goal: string;
    dietaryRestrictions?: string | null;
    otherInfo?: string | null;
    weight: string;
    height: string;
}

export interface AIReplyFormatted {
    dailyKcalSuggested: number;
    dailyCarbsSuggested: number;
    dailyProteinsSuggested: number;
    dailyFatsSuggested: number;
}

export interface User {
    name?: string | null;
    email: string;
    _id?: string;
    id?: string;
    image?: string | null;
    plan?: 'free' | 'mid' | 'pro' | 'admin';
    onboarding1Completed?: boolean;
    onboarding2Completed?: boolean;
    updatesRemaining?: number | null;
    dailyUpdates?: number | null;
    [key: string]: unknown;
}

export interface MedicalRestrictionsFormatted {
    dietaryRestrictions?: string;
    otherInfo?: string;
    age?: number;
}

export interface MedicalRestrictionsResponse {
    recommendations?: string[];
    error?: string;
    details?: string;
    status?: number;
    success?: boolean;
}