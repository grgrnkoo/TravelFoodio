import Meal from "./Meal";

export default class Menu {
    constructor(menuData) {
        this.userId = menuData.userId;
        this.meals = (menuData.menu || []).map(
            meal => new Meal(meal.name, meal.calories, meal.protein, meal.fats, meal.carbs)
        );
    }

    calculateTotalNutrition() {
        return this.meals.reduce(
            (totals, meal) => {
                totals.calories += meal.calories || 0;
                totals.protein += meal.protein || 0;
                totals.fats += meal.fats || 0;
                totals.carbs += meal.carbs || 0;
                return totals;
            },
            { calories: 0, protein: 0, fats: 0, carbs: 0 }
        );
    }

    toJSON() {
        return {
            userId: this.userId,
            menu: this.meals.map(meal => ({
                name: meal.name,
                calories: meal.calories,
                protein: meal.protein,
                fats: meal.fats,
                carbs: meal.carbs
            }))
        };
    }
}

