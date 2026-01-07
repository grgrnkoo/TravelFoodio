import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@lib/adminAuth';
import { getSupabaseServerClient } from '@lib/supabase/server';
import { logError } from '@lib/errorLogger';

const supabase = getSupabaseServerClient();

// GET /api/admin/generations - List all generations with user info
export async function GET(req: NextRequest) {
    try {
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await requireAdmin(authData.userId);

        const searchParams = req.nextUrl.searchParams;
        const type = searchParams.get('type') as 'menu' | 'meal' | null;
        const userId = searchParams.get('userId') || undefined;
        const date = searchParams.get('date') || undefined;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = (page - 1) * limit;

        if (type === 'menu') {
            let query = supabase
                .from('menus')
                .select(`
                    *,
                    users!inner(id, email, name, subscription_type)
                `, { count: 'exact' });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            if (date) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);

                query = query
                    .gte('created_at', startDate.toISOString())
                    .lte('created_at', endDate.toISOString());
            }

            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data: menus, error, count } = await query;

            if (error) {
                throw error;
            }

            const total = count || 0;
            const totalPages = Math.ceil(total / limit);

            return NextResponse.json({
                success: true,
                type: 'menu',
                generations: (menus || []).map((menu: {
                    id: string;
                    user_id: string;
                    created_at: string;
                    users: { id: string; email: string; name: string | null; subscription_type: string };
                }) => ({
                    id: menu.id,
                    userId: menu.user_id,
                    userEmail: menu.users.email,
                    userName: menu.users.name,
                    userSubscription: menu.users.subscription_type,
                    createdAt: menu.created_at,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            });
        } else if (type === 'meal') {
            let query = supabase
                .from('meal_generations')
                .select(`
                    *,
                    users!inner(id, email, name, subscription_type)
                `, { count: 'exact' });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            if (date) {
                query = query.eq('generation_date', date);
            }

            query = query
                .order('generated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data: meals, error, count } = await query;

            if (error) {
                throw error;
            }

            const total = count || 0;
            const totalPages = Math.ceil(total / limit);

            return NextResponse.json({
                success: true,
                type: 'meal',
                generations: (meals || []).map((meal: {
                    id: string;
                    user_id: string;
                    generated_at: string;
                    generation_date: string;
                    users: { id: string; email: string; name: string | null; subscription_type: string };
                }) => ({
                    id: meal.id,
                    userId: meal.user_id,
                    userEmail: meal.users.email,
                    userName: meal.users.name,
                    userSubscription: meal.users.subscription_type,
                    generatedAt: meal.generated_at,
                    generationDate: meal.generation_date,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            });
        } else {
            // Get aggregated counts per user
            const { data: menuCounts, error: menuError } = await supabase
                .from('menus')
                .select('user_id')
                .select('users!inner(id, email, name)');

            if (menuError) {
                throw menuError;
            }

            const { data: mealCounts, error: mealError } = await supabase
                .from('meal_generations')
                .select('user_id')
                .select('users!inner(id, email, name)');

            if (mealError) {
                throw mealError;
            }

            // Aggregate counts
            const userCounts = new Map<string, { userId: string; email: string; name: string | null; menuCount: number; mealCount: number }>();

            ((menuCounts || []) as unknown as Array<{ user_id: string; users: { id: string; email: string; name: string | null } }>).forEach((item) => {
                const existing = userCounts.get(item.user_id);
                if (existing) {
                    existing.menuCount += 1;
                } else {
                    userCounts.set(item.user_id, {
                        userId: item.user_id,
                        email: item.users.email,
                        name: item.users.name,
                        menuCount: 1,
                        mealCount: 0,
                    });
                }
            });

            ((mealCounts || []) as unknown as Array<{ user_id: string; users: { id: string; email: string; name: string | null } }>).forEach((item) => {
                const existing = userCounts.get(item.user_id);
                if (existing) {
                    existing.mealCount += 1;
                } else {
                    userCounts.set(item.user_id, {
                        userId: item.user_id,
                        email: item.users.email,
                        name: item.users.name,
                        menuCount: 0,
                        mealCount: 1,
                    });
                }
            });

            const aggregated = Array.from(userCounts.values())
                .sort((a, b) => (b.menuCount + b.mealCount) - (a.menuCount + a.mealCount));

            return NextResponse.json({
                success: true,
                type: 'aggregated',
                generations: aggregated,
            });
        }
    } catch (error) {
        const authData = await auth().catch(() => ({ userId: undefined }));
        await logError(error, {
            userId: authData.userId ?? undefined,
            endpoint: '/api/admin/generations',
            severity: 'high',
        });

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch generations', details: message },
            { status: 500 }
        );
    }
}

