import { IUser, IUserMeal } from '../../types';

export default class MealClass {
    name: string;
    calories: number;
    cuisine: string;
    weight: number;
    protein: number;
    fats: number;
    carbs: number;
    ingredients: string[];
    like: boolean;
    dislike: boolean;

    constructor(
        name: string,
        calories: number = 0,
        cuisine: string = '',
        weight: number = 0,
        protein: number = 0,
        fats: number = 0,
        carbs: number = 0,
        ingredients: string[] = [],
        like: boolean = false,
        dislike: boolean = false
    ) {
        this.name = name;
        this.calories = calories;
        this.cuisine = cuisine;
        this.weight = weight;
        this.protein = protein;
        this.fats = fats;
        this.carbs = carbs;
        this.ingredients = ingredients;
        this.like = like;
        this.dislike = dislike;
    }

    toggleLikeDislike(action: 'like' | 'dislike', user: IUser): boolean {
        user.favoriteMeals = user.favoriteMeals || [];
        user.dislikedMeals = user.dislikedMeals || [];

        const mealNames = (meals: IUserMeal[]) => meals.map(m => m.name);

        if (action === "like") {
            if (!mealNames(user.favoriteMeals).includes(this.name)) {
                user.favoriteMeals.push({ name: this.name, dateLastUpdated: new Date() });
            }
            user.dislikedMeals = user.dislikedMeals.filter((m: IUserMeal) => m.name !== this.name);
        } else if (action === "dislike") {
            if (!mealNames(user.dislikedMeals).includes(this.name)) {
                user.dislikedMeals.push({ name: this.name, dateLastUpdated: new Date() });
            }
            user.favoriteMeals = user.favoriteMeals.filter((m: IUserMeal) => m.name !== this.name);
        }
        return true;
    }
}
