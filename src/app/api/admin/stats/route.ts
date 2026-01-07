import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@lib/adminAuth';
import { getSupabaseServerClient } from '@lib/supabase/server';
import { getErrorStats } from '@lib/supabase/queries/errorLogs';
import { logError } from '@lib/errorLogger';

const supabase = getSupabaseServerClient();

// GET /api/admin/stats - Get aggregated statistics
export async function GET(req: NextRequest) {
    try {
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await requireAdmin(authData.userId);

        // Get user statistics
        const { count: totalUsers, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (usersError) {
            throw usersError;
        }

        // Get active users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: activeUsers, error: activeError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thirtyDaysAgo.toISOString());

        if (activeError) {
            throw activeError;
        }

        // Get users by subscription type
        const { data: usersByType, error: typeError } = await supabase
            .from('users')
            .select('subscription_type');

        if (typeError) {
            throw typeError;
        }

        const subscriptionDistribution: Record<string, number> = {};
        (usersByType || []).forEach((user: { subscription_type: string }) => {
            const type = user.subscription_type || 'free';
            subscriptionDistribution[type] = (subscriptionDistribution[type] || 0) + 1;
        });

        // Get generation statistics
        const { count: totalMenuGenerations, error: menuError } = await supabase
            .from('menus')
            .select('*', { count: 'exact', head: true });

        if (menuError) {
            throw menuError;
        }

        const { count: totalMealGenerations, error: mealError } = await supabase
            .from('meal_generations')
            .select('*', { count: 'exact', head: true });

        if (mealError) {
            throw mealError;
        }

        // Get today's generations
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: todayMenuGenerations, error: todayMenuError } = await supabase
            .from('menus')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        if (todayMenuError) {
            throw todayMenuError;
        }

        const { count: todayMealGenerations, error: todayMealError } = await supabase
            .from('meal_generations')
            .select('*', { count: 'exact', head: true })
            .gte('generated_at', today.toISOString());

        if (todayMealError) {
            throw todayMealError;
        }

        // Get daily generation trends (last 30 days)
        const dailyTrends: Array<{ date: string; menus: number; meals: number }> = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const [menuResult, mealResult] = await Promise.all([
                supabase
                    .from('menus')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', date.toISOString())
                    .lt('created_at', nextDate.toISOString()),
                supabase
                    .from('meal_generations')
                    .select('*', { count: 'exact', head: true })
                    .gte('generated_at', date.toISOString())
                    .lt('generated_at', nextDate.toISOString()),
            ]);

            dailyTrends.push({
                date: date.toISOString().split('T')[0],
                menus: menuResult.count || 0,
                meals: mealResult.count || 0,
            });
        }

        // Get error statistics
        const errorStats = await getErrorStats();

        return NextResponse.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers || 0,
                    active: activeUsers || 0, // Last 30 days
                    bySubscriptionType: subscriptionDistribution,
                },
                generations: {
                    totalMenus: totalMenuGenerations || 0,
                    totalMeals: totalMealGenerations || 0,
                    todayMenus: todayMenuGenerations || 0,
                    todayMeals: todayMealGenerations || 0,
                    dailyTrends,
                },
                errors: errorStats,
            },
        });
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId ?? undefined,
            endpoint: '/api/admin/stats',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch statistics', details: message },
            { status: 500 }
        );
    }
}

