import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@lib/adminAuth';
import { getSupabaseServerClient } from '@lib/supabase/server';
import { getUserById, getUserFullProfile } from '@lib/supabase/queries/users';
import { logError } from '@lib/errorLogger';

const supabase = getSupabaseServerClient();

// GET /api/admin/users/[userId] - Get full user details
export async function GET(
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

        // Get full user profile
        const user = await getUserById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get full profile with preferences
        const fullProfile = await getUserFullProfile(user.clerkUserId);

        // Get generation counts
        const [menuCount, mealCount] = await Promise.all([
            supabase
                .from('menus')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId),
            supabase
                .from('meal_generations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId),
        ]);

        return NextResponse.json({
            success: true,
            user: fullProfile,
            stats: {
                menuGenerations: menuCount.count || 0,
                mealGenerations: mealCount.count || 0,
            },
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId ?? undefined,
            endpoint: '/api/admin/users/[userId]',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch user', details: message },
            { status: 500 }
        );
    }
}

// PATCH /api/admin/users/[userId] - Update user
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

        const updateData: Record<string, unknown> = {};

        // Map camelCase to snake_case
        if (body.dailyUpdates !== undefined) {
            updateData.daily_updates = body.dailyUpdates;
        }
        if (body.subscriptionType !== undefined) {
            updateData.subscription_type = body.subscriptionType;
        }
        if (body.updatesRemaining !== undefined) {
            updateData.updates_remaining = body.updatesRemaining;
        }
        if (body.name !== undefined) {
            updateData.name = body.name;
        }
        if (body.email !== undefined) {
            updateData.email = body.email;
        }
        if (body.onboarding1Completed !== undefined) {
            updateData.onboarding1_completed = body.onboarding1Completed;
        }
        if (body.onboarding2Completed !== undefined) {
            updateData.onboarding2_completed = body.onboarding2Completed;
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            await logError(error, {
                userId: authData.userId ?? undefined,
                endpoint: '/api/admin/users/[userId]',
                requestData: body,
                severity: 'high',
            });
            return NextResponse.json(
                { error: 'Failed to update user', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                clerkUserId: updatedUser.clerk_user_id,
                email: updatedUser.email,
                name: updatedUser.name,
                subscriptionType: updatedUser.subscription_type,
                dailyUpdates: updatedUser.daily_updates,
                updatesRemaining: updatedUser.updates_remaining,
                onboarding1Completed: updatedUser.onboarding1_completed,
                onboarding2Completed: updatedUser.onboarding2_completed,
            },
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId ?? undefined,
            endpoint: '/api/admin/users/[userId]',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update user', details: message },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[userId] - Delete user
export async function DELETE(
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

        // Check if trying to delete self
        const currentUser = await getUserById(authData.userId);
        if (currentUser?.id === userId) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) {
            await logError(error, {
                userId: authData.userId ?? undefined,
                endpoint: '/api/admin/users/[userId]',
                severity: 'high',
            });
            return NextResponse.json(
                { error: 'Failed to delete user', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId ?? undefined,
            endpoint: '/api/admin/users/[userId]',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to delete user', details: message },
            { status: 500 }
        );
    }
}

