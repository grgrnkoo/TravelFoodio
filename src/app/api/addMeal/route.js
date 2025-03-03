import { NextResponse } from 'next/server';
import dbConnect from '../../../../_lib/dbConnect';
import Meal from '../../../../models/Meal';

export async function POST(req) {
  try {
    await dbConnect();
    const mealData = await req.json(); // Expecting a meal object: { name, cuisine, ingredients, ... }

    // Check if meal exists by name
    const existingMeal = await Meal.findOne({ name: mealData.name });
    if (existingMeal) {
      return NextResponse.json({ success: true, message: 'Meal already exists', meal: existingMeal });
    }

    // Add new meal
    const newMeal = new Meal(mealData);
    await newMeal.save();

    return NextResponse.json({ success: true, message: 'Meal added', meal: newMeal }, { status: 201 });
  } catch (error) {
    console.error('Error adding meal:', error);
    return NextResponse.json({ success: false, error: 'Failed to add meal' }, { status: 500 });
  }
}