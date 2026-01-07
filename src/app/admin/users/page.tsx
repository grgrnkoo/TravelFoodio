import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@lib/adminAuth";
import { getSupabaseServerClient } from "@lib/supabase/server";
import UsersTable from "./UsersTable";

const supabase = getSupabaseServerClient();

async function getUsers(searchParams: { page?: string; search?: string }) {
    const page = parseInt(searchParams.page || '1', 10);
    const limit = 50;
    const search = searchParams.search || '';
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
        throw error;
    }

    // Get generation counts for each user
    const userIds = (users || []).map(u => u.id);

    const [menuCounts, mealCounts] = await Promise.all([
        supabase
            .from('menus')
            .select('user_id')
            .in('user_id', userIds),
        supabase
            .from('meal_generations' as any)
            .select('user_id')
            .in('user_id', userIds),
    ]);

    // Aggregate counts
    const menuCountMap = new Map<string, number>();
    const mealCountMap = new Map<string, number>();

    if (menuCounts.data && !menuCounts.error) {
        (menuCounts.data as Array<{ user_id: string }>).forEach((row) => {
            menuCountMap.set(row.user_id, (menuCountMap.get(row.user_id) || 0) + 1);
        });
    }

    if (mealCounts.data && !mealCounts.error) {
        (mealCounts.data as unknown as Array<{ user_id: string }>).forEach((row) => {
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

    return {
        users: usersWithCounts,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
}

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string }>;
}) {
    const authData = await auth();
    if (!authData.userId) {
        throw new Error('Unauthorized');
    }

    await requireAdmin(authData.userId);

    const params = await searchParams;
    const { users, pagination } = await getUsers(params);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Users Management</h1>
            </div>

            <UsersTable
                initialUsers={users}
                initialPagination={pagination}
                initialSearch={params.search || ''}
            />
        </div>
    );
}
