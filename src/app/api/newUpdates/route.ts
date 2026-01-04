import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../_lib/supabase/server';

export async function PATCH(req: Request) {
  try {
    const { userId, updates } = await req.json();

    // Validate input
    if (!userId || typeof updates !== 'number' || updates < 0 || !Number.isInteger(updates)) {
      return NextResponse.json(
        { error: 'Invalid input: userId is required, and updates must be a non-negative integer' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update({ updates_remaining: updates })
      .eq('id', userId)
      .select('updates_remaining')
      .single();

    if (error || !user) {
      console.error('Error updating user:', error?.message);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, updatesRemaining: user.updates_remaining });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating user:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
