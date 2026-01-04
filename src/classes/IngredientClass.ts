export default class IngredientClass {
    name: string;
    ingredientId: string;
    rating: number;
    dateAdded: string;

    constructor(
        name: string,
        ingredientId: string,
        rating: number = 0,
        dateAdded: string = new Date().toISOString().split('T')[0]
    ) {
        this.name = name;
        this.ingredientId = ingredientId;
        this.rating = rating;
        this.dateAdded = dateAdded;
    }

    increaseRating(): void {
        this.rating++;
    }

    decreaseRating(): void {
        this.rating--;
    }

    getInfo(): { name: string; ingredientId: string; rating: number; dateAdded: string } {
        return {
            name: this.name,
            ingredientId: this.ingredientId,
            rating: this.rating,
            dateAdded: this.dateAdded
        };
    }
}
