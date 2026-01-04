import { NextResponse } from 'next/server';
import { upsertMealToCatalog } from '../../../../_lib/supabase/queries/menus';

export async function POST(req: Request) {
  try {
    const mealData = await req.json(); // Expecting a meal object: { name, cuisine, ingredients, ... }

    if (!mealData.name) {
      return NextResponse.json({ success: false, error: 'Meal name is required' }, { status: 400 });
    }

    // Upsert meal (insert or update if exists)
    const success = await upsertMealToCatalog({
      name: mealData.name,
      cuisine: mealData.cuisine,
      ingredients: mealData.ingredients,
      calories: mealData.calories,
      weight: mealData.weight,
      protein: mealData.protein,
      fats: mealData.fats,
      carbs: mealData.carbs,
    });

    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to add meal' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Meal added/updated' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error adding meal:', message);
    return NextResponse.json({ success: false, error: 'Failed to add meal' }, { status: 500 });
  }
}
