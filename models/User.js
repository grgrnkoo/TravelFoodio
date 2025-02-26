import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: false,
        unique: true
    },
    name: {
        type: String,
        required: false
    },
    age: {
        type: String,
        required: false,
        default: "0"
    },
    location: {
        type: String,
        required: false,
        default: ""
    },
    goals: {
        type: String,
        required: false,
        default: ""
    },
    dietaryRestrictions: {
        type: String,
        required: false,
        default: ""
    },
    favoriteMeals: {
        type: [{
            name: { type: String, required: true },
            // mealId: { type: mongoose.Schema.Types.ObjectId, required: true },
            // mealIngredients: { type: [String], default: [] },
            dateAdded: { type: Date, default: Date.now }
        }],
        required: false,
        default: []
    },
    dislikedMeals: {
        type: [{
            name: { type: String, required: true },
            // mealId: { type: mongoose.Schema.Types.ObjectId, required: true },
            // mealIngredients: { type: [String], default: [] },
            dateAdded: { type: Date, default: Date.now }
        }],
        required: false,
        default: []
    },
    ingredients: {
        type: [{
            name: { type: String, required: true },
            // ingredientId: { type: mongoose.Schema.Types.ObjectId, required: true },
            rating: { type: Number, default: 0 },
            dateAdded: { type: Date, default: Date.now }

        }],
        required: false,
        default: []
    },
    cuisines: {
        type: [{
            name: { type: String, required: true },
            // cuisineId: { type: mongoose.Schema.Types.ObjectId, required: true },
            rating: { type: Number, default: 0 },
            dateAdded: { type: Date, default: Date.now }

        }],
        required: false,
        default: []
    }
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;