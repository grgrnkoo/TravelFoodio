import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    weight: {
        type: Number,
        required: false
    },
    goals: {
        type: String,
        required: false
    },
    additionalInfo: {
        type: String,
        required: false
    }
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;