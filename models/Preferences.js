import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    }
}, { timestamps: true })

const Preferences = mongoose.models.Preferences || mongoose.model("Preferences", preferencesSchema);

export default Preferences;