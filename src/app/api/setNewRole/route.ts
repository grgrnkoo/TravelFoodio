import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../_lib/supabase/server';

export async function PATCH(req: Request) {
  try {
    const { userId, subscriptionType } = await req.json();

    if (!userId || !subscriptionType) {
      return NextResponse.json({ error: 'User ID and subscription type are required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: user, error } = await supabase
      .from('users')
      .update({ subscription_type: subscriptionType })
      .eq('id', userId)
      .select('subscription_type')
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscriptionType: user.subscription_type });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating subscription:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
