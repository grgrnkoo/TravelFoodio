import { NextResponse } from "next/server";
import User from "../../../../models/User";
import dbConnect from "../../../../_lib/dbConnect";

export async function PATCH(req) {
    try {
        await dbConnect();
        const { userId, likedMeals, dislikedMeals, ingredients, cuisines } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ✅ Update favoriteMeals & dislikedMeals
        user.favoriteMeals = [
            ...user.favoriteMeals.filter(meal => !dislikedMeals.some(d => d.name === meal.name)),
            ...likedMeals
        ];

        user.dislikedMeals = [
            ...user.dislikedMeals.filter(meal => !likedMeals.some(l => l.name === meal.name)),
            ...dislikedMeals
        ];

        // ✅ Update ingredients (merge new with existing, keeping unique names)
        ingredients.forEach(newIng => {
            const existingIng = user.ingredients.find(ing => ing.name === newIng.name);
            if (existingIng) {
                existingIng.rating += newIng.rating;
            } else {
                user.ingredients.push(newIng);
            }
        });

        // ✅ Update cuisines (merge new with existing, keeping unique names)
        cuisines.forEach(newCuisine => {
            const existingCuisine = user.cuisines.find(c => c.name === newCuisine.name);
            if (existingCuisine) {
                existingCuisine.rating += newCuisine.rating;
            } else {
                user.cuisines.push(newCuisine);
            }
        });

        await user.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating preferences:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
