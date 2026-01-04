import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../_lib/supabase/server';

export async function PATCH(req: Request) {
    try {
        const supabase = getSupabaseServerClient();

        // This is a hardcoded admin endpoint - should be secured in production
        const userId = '67dfa7ce1c9f2242f95277dc'; // Replace with the actual user ID
        const subscriptionType = 'admin';

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
        console.error('Error setting role:', message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
