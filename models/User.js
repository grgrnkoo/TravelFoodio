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
        type: mongoose.Schema.Types.Mixed,
        required: false, 
        default: []
    },
    rejectedMeals: {
        type: Array,
        required: false, 
        default: []
    },
    recentMeals: {
        type: Array,
        required: false, 
        default: []
    },
    dislikedIngredients: {
        type: [String],
        required: false,
        default: []
    }
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;