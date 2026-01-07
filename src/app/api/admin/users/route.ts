import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@lib/adminAuth';
import { getSupabaseServerClient } from '@lib/supabase/server';
import { logError } from '@lib/errorLogger';

const supabase = getSupabaseServerClient();

// GET /api/admin/users - List all users with pagination
export async function GET(req: NextRequest) {
    try {
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await requireAdmin(authData.userId);

        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const search = searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        let query = supabase
            .from('users')
            .select('*', { count: 'exact' });

        // Search by email or name
        if (search) {
            query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
        }

        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: users, error, count } = await query;

        if (error) {
            await logError(error, {
                userId: authData.userId ?? undefined,
                endpoint: '/api/admin/users',
                severity: 'high',
            });
            return NextResponse.json(
                { error: 'Failed to fetch users', details: error.message },
                { status: 500 }
            );
        }

        // Get generation counts for each user
        const userIds = (users || []).map(u => u.id);

        const [menuCounts, mealCounts] = await Promise.all([
            supabase
                .from('menus')
                .select('user_id', { count: 'exact', head: false })
                .in('user_id', userIds),
            supabase
                .from('meal_generations')
                .select('user_id', { count: 'exact', head: false })
                .in('user_id', userIds),
        ]);

        // Aggregate counts
        const menuCountMap = new Map<string, number>();
        const mealCountMap = new Map<string, number>();

        if (menuCounts.data) {
            menuCounts.data.forEach((row: { user_id: string }) => {
                menuCountMap.set(row.user_id, (menuCountMap.get(row.user_id) || 0) + 1);
            });
        }

        if (mealCounts.data) {
            mealCounts.data.forEach((row: { user_id: string }) => {
                mealCountMap.set(row.user_id, (mealCountMap.get(row.user_id) || 0) + 1);
            });
        }

        const usersWithCounts = (users || []).map(user => ({
            id: user.id,
            clerkUserId: user.clerk_user_id,
            email: user.email,
            name: user.name,
            image: user.image,
            subscriptionType: user.subscription_type,
            dailyUpdates: user.daily_updates,
            updatesRemaining: user.updates_remaining,
            onboarding1Completed: user.onboarding1_completed,
            onboarding2Completed: user.onboarding2_completed,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            menuGenerations: menuCountMap.get(user.id) || 0,
            mealGenerations: mealCountMap.get(user.id) || 0,
        }));

        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            users: usersWithCounts,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId ?? undefined,
            endpoint: '/api/admin/users',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch users', details: message },
            { status: 500 }
        );
    }
}

