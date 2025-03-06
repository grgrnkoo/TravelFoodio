import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    menu: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now, 
        index: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Auto-sets to 7 days from now
    }
})

const Menu = mongoose.models.Menu || mongoose.model("Menu", menuSchema);

export default Menu;