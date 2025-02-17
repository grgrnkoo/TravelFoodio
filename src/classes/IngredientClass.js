export default class IngredientClass {
    constructor(name, ingredientId, rating = 0, dateAdded = new Date().toISOString().split('T')[0]) {
        this.name = name;
        this.ingredientId = ingredientId;
        this.rating = rating;
        this.dateAdded = dateAdded;
    }

    increaseRating() {
        this.rating++; // You can add a limit if needed
    }

    decreaseRating() {
        this.rating--; // You can add a lower limit if needed
    }

    getInfo() {
        return {
            name: this.name,
            ingredientId: this.ingredientId,
            rating: this.rating,
            dateAdded: this.dateAdded
        };
    }
}
