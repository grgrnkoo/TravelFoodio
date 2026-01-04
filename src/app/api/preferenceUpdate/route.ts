import { NextResponse } from 'next/server';
import { handleMealPreference } from '../../../../_lib/supabase/queries/preferences';

export async function PATCH(req: Request) {
  try {
    const { userId, meal, action } = await req.json();
    
    if (!userId || !meal || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action !== 'like' && action !== 'dislike') {
      return NextResponse.json({ error: 'Invalid action. Must be "like" or "dislike"' }, { status: 400 });
    }

    const result = await handleMealPreference(userId, {
      name: meal.name,
      ingredients: meal.ingredients,
      cuisine: Array.isArray(meal.cuisine) ? meal.cuisine[0] : meal.cuisine,
    }, action);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating preferences:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
