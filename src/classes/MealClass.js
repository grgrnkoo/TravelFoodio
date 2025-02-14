export default class MealClass {
    constructor(name, calories = 0, cuisine = '', weight = 0, protein = 0, fats = 0, carbs = 0, ingredients = [], like = false, dislike = false) {
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

    // Toggle a meal between liked/disliked
    toggleLikeDislike(action, user) {
        user.favoriteMeals = user.favoriteMeals || [];
        user.rejectedMeals = user.rejectedMeals || [];
        
        if (action === "like") {
            if (!user.favoriteMeals.includes(this.meal)) {
                user.favoriteMeals.push(this.meal);
            }
            user.rejectedMeals = user.rejectedMeals.filter(name => name !== this.name);
        } else if (action === "dislike") {
            if (!user.rejectedMeals.includes(this.meal)) {
                user.rejectedMeals.push(this.meal);
            }
            user.favoriteMeals = user.favoriteMeals.filter(name => name !== this.meal);
        }
        return true;
    }
}
