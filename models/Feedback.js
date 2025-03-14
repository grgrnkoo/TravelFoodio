import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    author: {
        type: String,
        default: 'Not logged in',
        trim: true
    },
    feedback: {
        type: String,
        required: true,
        validate: {
            validator: (value) => value.trim().length > 0,
            message: 'Feedback cannot be empty'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
})

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

export default Feedback;