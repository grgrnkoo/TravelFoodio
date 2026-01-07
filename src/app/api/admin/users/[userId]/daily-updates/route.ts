import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@lib/adminAuth';
import { getSupabaseServerClient } from '@lib/supabase/server';
import { logError } from '@lib/errorLogger';

const supabase = getSupabaseServerClient();

// PATCH /api/admin/users/[userId]/daily-updates
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
        const { daily_updates } = body;

        if (typeof daily_updates !== 'number' || daily_updates < 0) {
            return NextResponse.json(
                { error: 'daily_updates must be a non-negative number' },
                { status: 400 }
            );
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ daily_updates: daily_updates })
            .eq('id', userId)
            .select('daily_updates')
            .single();

        if (error) {
            await logError(error, {
                userId: authData.userId ?? undefined,
                endpoint: '/api/admin/users/[userId]/daily-updates',
                requestData: body,
                severity: 'high',
            });
            return NextResponse.json(
                { error: 'Failed to update daily updates', details: error.message },
                { status: 500 }
            );
        }

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            daily_updates: updatedUser.daily_updates,
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId ?? undefined,
            endpoint: '/api/admin/users/[userId]/daily-updates',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update daily updates', details: message },
            { status: 500 }
        );
    }
}

