import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    menu: {
        type: { Object },
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    }
})

const Menu = mongoose.models.Menu || mongoose.model("User", menuSchema);

export default Menu;