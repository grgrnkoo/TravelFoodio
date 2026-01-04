import Meal from "./MealClass";

interface MealData {
    name: string;
    calories?: number;
    cuisine?: string;
    weight?: number;
    protein?: number;
    fats?: number;
    carbs?: number;
    ingredients?: string[];
    like?: boolean;
    dislike?: boolean;
}

interface TotalNutrition {
    name: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
}

export default class MenuClass {
    meals: Meal[];

    constructor(menuData: MealData[] | Meal[] = []) {
        this.meals = (Array.isArray(menuData) ? menuData : []).map(meal =>
            meal instanceof Meal ? meal : new Meal(
                meal.name,
                meal.calories,
                meal.cuisine,
                meal.weight || 0,
                meal.protein,
                meal.fats,
                meal.carbs,
                meal.ingredients || [],
                meal.like || false,
                meal.dislike || false
            )
        );
    }

    calculateTotalNutrition(): TotalNutrition {
        return this.meals.reduce(
            (totals, meal) => {
                totals.name = 'Total Nutrition';
                totals.calories += meal.calories || 0;
                totals.protein += meal.protein || 0;
                totals.fats += meal.fats || 0;
                totals.carbs += meal.carbs || 0;
                return totals;
            },
            { name: '', calories: 0, protein: 0, fats: 0, carbs: 0 }
        );
    }

    addMeal(meal: Meal | MealData): void {
        const mealToAdd = meal instanceof Meal ? meal : new Meal(
            meal.name,
            meal.calories,
            meal.cuisine,
            meal.weight || 0,
            meal.protein,
            meal.fats,
            meal.carbs,
            meal.ingredients || [],
            meal.like || false,
            meal.dislike || false
        );
        this.meals.push(mealToAdd);
    }

    toJSON(): { menu: MealData[] } {
        return {
            menu: this.meals.map(meal => ({
                name: meal.name,
                calories: meal.calories,
                protein: meal.protein,
                fats: meal.fats,
                carbs: meal.carbs,
                cuisine: meal.cuisine,
                weight: meal.weight,
                ingredients: meal.ingredients,
                like: meal.like,
                dislike: meal.dislike
            }))
        };
    }
}
