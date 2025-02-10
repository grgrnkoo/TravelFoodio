import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: false
    },
    age: {
        type: String,
        required: false,
        default: 0
    },
    location: {
        type: String,
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
    }
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;