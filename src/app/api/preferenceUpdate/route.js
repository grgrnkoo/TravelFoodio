// pages/api/preferenceUpdate.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../../_lib/dbConnect';
import User from '../../../../models/User';

export async function PATCH(req) {
  try {
    await dbConnect();
    const { userId, meal, action } = await req.json();
    if (!userId || !meal || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const mealName = meal.name;

    if (action === 'like') {
      const isLiked = user.favoriteMeals.some(m => m.name === mealName);
      if (isLiked) {
        // Unlike: remove from favoriteMeals
        user.favoriteMeals = user.favoriteMeals.filter(m => m.name !== mealName);
      } else {
        // Like: add to favoriteMeals, remove from dislikedMeals
        user.favoriteMeals = user.favoriteMeals.filter(m => m.name !== mealName); // Ensure no dupes
        user.favoriteMeals.push({ name: mealName, dateLastUpdated: new Date() });
        user.dislikedMeals = user.dislikedMeals.filter(m => m.name !== mealName);

        // Boost ratings
        if (meal.ingredients) {
          const ingredientsArray = Array.isArray(meal.ingredients) ? meal.ingredients : [meal.ingredients];
          ingredientsArray.forEach(ing => {
            const existing = user.ingredients.find(i => i.name === ing);
            if (existing) {
              existing.rating += 1;
              existing.dateLastUpdated = new Date(); // Update timestamp
            } else {
              user.ingredients.push({ name: ing, rating: 1, dateLastUpdated: new Date() });
            }
          });
        }
        if (meal.cuisine) {
          const cuisineName = Array.isArray(meal.cuisine) ? meal.cuisine[0] : meal.cuisine; // Handle array or string
          const existingCuisine = user.cuisines.find(c => c.name === cuisineName);
          if (existingCuisine) {
            existingCuisine.rating += 1;
            existingCuisine.dateLastUpdated = new Date();
          } else {
            user.cuisines.push({ name: cuisineName, rating: 1, dateLastUpdated: new Date() });
          }
        }
      }
    } else if (action === 'dislike') {
      const isDisliked = user.dislikedMeals.some(m => m.name === mealName);
      if (isDisliked) {
        // Undislike: remove from dislikedMeals
        user.dislikedMeals = user.dislikedMeals.filter(m => m.name !== mealName);
      } else {
        // Dislike: add to dislikedMeals, remove from favoriteMeals
        user.dislikedMeals = user.dislikedMeals.filter(m => m.name !== mealName); // Ensure no dupes
        user.dislikedMeals.push({ name: mealName, dateLastUpdated: new Date() });
        user.favoriteMeals = user.favoriteMeals.filter(m => m.name !== mealName);

        // Lower ratings
        if (meal.ingredients) {
          const ingredientsArray = Array.isArray(meal.ingredients) ? meal.ingredients : [meal.ingredients];
          ingredientsArray.forEach(ing => {
            const existing = user.ingredients.find(i => i.name === ing);
            if (existing) {
              existing.rating -= 1;
              existing.dateLastUpdated = new Date();
            } else {
              user.ingredients.push({ name: ing, rating: -1, dateLastUpdated: new Date() });
            }
          });
        }
        if (meal.cuisine) {
          const cuisineName = Array.isArray(meal.cuisine) ? meal.cuisine[0] : meal.cuisine;
          const existingCuisine = user.cuisines.find(c => c.name === cuisineName);
          if (existingCuisine) {
            existingCuisine.rating -= 1;
            existingCuisine.dateLastUpdated = new Date();
          } else {
            user.cuisines.push({ name: cuisineName, rating: -1, dateLastUpdated: new Date() });
          }
        }
      }
    }

    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}