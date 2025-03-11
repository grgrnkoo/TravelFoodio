import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
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
        type: Number,
        required: false,
        default: 0
    },
    location: {
        type: String,
        required: false,
        default: ""
    },
    dailyCaloriesSuggested: {
        type: Number,
        required: false,
        default: 0
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
            dateLastUpdated: { type: Date, default: Date.now, index: true }
        }],
        required: false,
        default: []
    },
    dislikedMeals: {
        type: [{
            name: { type: String, required: true },
            // mealId: { type: mongoose.Schema.Types.ObjectId, required: true },
            // mealIngredients: { type: [String], default: [] },
            dateLastUpdated: { type: Date, default: Date.now, index: true }
        }],
        required: false,
        default: []
    },
    ingredients: {
        type: [{
            name: { type: String, required: true },
            // ingredientId: { type: mongoose.Schema.Types.ObjectId, required: true },
            rating: { type: Number, default: 0, index: true },
            dateLastUpdated: { type: Date, default: Date.now }

        }],
        required: false,
        default: []
    },
    cuisines: {
        type: [{
            name: { type: String, required: true },
            // cuisineId: { type: mongoose.Schema.Types.ObjectId, required: true },
            rating: { type: Number, default: 0, index: true },
            dateLastUpdated: { type: Date, default: Date.now }

        }],
        required: false,
        default: []
    },
    updatesRemaining: {
        type: Number,
        required: true,
        default: 0,
    },
    subscriptionType: {
        type: String,
        required: true,
        default: 'free'
    },
    onboardingCompleted: {
        type: Boolean,
        required: true,
        default: false
    }
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;