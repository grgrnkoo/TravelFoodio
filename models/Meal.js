import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        default: '',
    },
    cuisine: {
        type: String,
        required: false,
      },
      ingredients: {
        type: [String],
        required: false,
        default: [],
      },
      calories: {
        type: Number,
        required: false,
      },
      weight: {
        type: Number
      },
      carbs: {
        type: Number,
        required: false,
      },
      fats: {
        type: Number,
        required: false,
      },
      protein: {
        type: Number,
        required: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
})

const Meal = mongoose.models.Meal || mongoose.model("Meal", mealSchema);

export default Meal;