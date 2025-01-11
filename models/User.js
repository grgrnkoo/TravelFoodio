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
        type: Number,
        required: false,
        default: 0
    },
    weight: {
        type: Number,
        required: false,
        default: 0
    },
    goals: {
        type: String,
        required: false,
        default: ""
    },
    additionalInfo: {
        type: String,
        required: false,
        default: ""
    }
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;