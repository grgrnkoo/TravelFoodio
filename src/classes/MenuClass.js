import Meal from "./MealClass";

export default class MenuClass {
    constructor(menuData = []) {
        this.meals = (Array.isArray(menuData) ? menuData : []).map(meal =>
            new Meal(
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

    calculateTotalNutrition() {
        return this.meals.reduce(
            (totals, meal) => {
                totals.name = 'Total Nutrition';
                totals.calories += meal.calories || 0;
                totals.protein += meal.protein || 0;
                totals.fats += meal.fats || 0;
                totals.carbs += meal.carbs || 0;
                return totals;
            },
            { calories: 0, protein: 0, fats: 0, carbs: 0 }
        );
    }

    addMeal(meal) {
        // Ensure the added meal is an instance of MealClass
        if (!(meal instanceof Meal)) {
            meal = new Meal(
                meal.meal, 
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
        }
        this.meals.push(meal);
    }

    toJSON() {
        return {
            menu: this.meals.map(meal => ({
                meal: meal.meal,
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
