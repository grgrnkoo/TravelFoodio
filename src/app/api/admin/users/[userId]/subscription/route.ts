import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@lib/adminAuth';
import { getSupabaseServerClient } from '@lib/supabase/server';
import { logError } from '@lib/errorLogger';

const supabase = getSupabaseServerClient();

const VALID_SUBSCRIPTION_TYPES = ['free', 'paid', 'premium', 'admin'];

// PATCH /api/admin/users/[userId]/subscription
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await requireAdmin(authData.userId);

        const { userId } = await params;
        const body = await req.json();
        const { subscription_type } = body;

        if (!subscription_type || !VALID_SUBSCRIPTION_TYPES.includes(subscription_type)) {
            return NextResponse.json(
                { error: `subscription_type must be one of: ${VALID_SUBSCRIPTION_TYPES.join(', ')}` },
                { status: 400 }
            );
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ subscription_type: subscription_type })
            .eq('id', userId)
            .select('subscription_type')
            .single();

        if (error) {
            await logError(error, {
                userId: authData.userId ?? undefined,
                endpoint: '/api/admin/users/[userId]/subscription',
                requestData: body,
                severity: 'high',
            });
            return NextResponse.json(
                { error: 'Failed to update subscription', details: error.message },
                { status: 500 }
            );
        }

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            subscription_type: updatedUser.subscription_type,
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId ?? undefined,
            endpoint: '/api/admin/users/[userId]/subscription',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update subscription', details: message },
            { status: 500 }
        );
    }
}

