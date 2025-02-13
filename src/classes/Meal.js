export default class Meal {
    constructor(name, calories = 0, protein = 0, fats = 0, carbs = 0) {
        this.name = name;
        this.calories = calories;
        this.protein = protein;
        this.fats = fats;
        this.carbs = carbs;
    }

    // Toggle a meal between liked/disliked
    toggleLikeDislike(action, user) {
        if (action === "like") {
            if (!user.favoriteMeals.includes(this.name)) {
                user.favoriteMeals.push(this.name);
            }
            user.rejectedMeals = user.rejectedMeals.filter(name => name !== this.name);
        } else if (action === "dislike") {
            if (!user.rejectedMeals.includes(this.name)) {
                user.rejectedMeals.push(this.name);
            }
            user.favoriteMeals = user.favoriteMeals.filter(name => name !== this.name);
        }
        return true;
    }
}
