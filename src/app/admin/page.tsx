import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@lib/adminAuth";
import { getSupabaseServerClient } from "@lib/supabase/server";
import { getErrorStats } from "@lib/supabase/queries/errorLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";

const supabase = getSupabaseServerClient();

// Helper to get meal generation count (since meal_generations table isn't in types yet)
async function getMealGenerationCount(startDate?: string, endDate?: string): Promise<number> {
    let query = supabase
        .from('meal_generations' as any)
        .select('*', { count: 'exact', head: true });
    
    if (startDate) {
        query = query.gte('generated_at', startDate);
    }
    if (endDate) {
        query = query.lt('generated_at', endDate);
    }
    
    const { count } = await query;
    return count || 0;
}

async function getDashboardStats() {
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

    const totalMealGenerations = await getMealGenerationCount();

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

    const todayMealGenerations = await getMealGenerationCount(today.toISOString());

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
            getMealGenerationCount(date.toISOString(), nextDate.toISOString()),
        ]);

        dailyTrends.push({
            date: date.toISOString().split('T')[0],
            menus: menuResult.count || 0,
            meals: mealResult.count || 0,
        });
    }

    // Get error statistics
    const errorStats = await getErrorStats();

    return {
        users: {
            total: totalUsers || 0,
            active: activeUsers || 0,
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
    };
}

export default async function AdminDashboard() {
    const authData = await auth();
    if (!authData.userId) {
        throw new Error('Unauthorized');
    }

    await requireAdmin(authData.userId);

    const stats = await getDashboardStats();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.users.active} active (30 days)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today&apos;s Generations</CardTitle>
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.generations.todayMenus + stats.generations.todayMeals}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.generations.todayMenus} menus, {stats.generations.todayMeals} meals
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unresolved Errors</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.errors.unresolved}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.errors.recentCount} in last 24h
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.generations.totalMenus + stats.generations.totalMeals}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.generations.totalMenus} menus, {stats.generations.totalMeals} meals
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Users by Subscription Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(stats.users.bySubscriptionType).map(([type, count]) => (
                                <div key={type} className="flex justify-between items-center">
                                    <span className="capitalize">{type}</span>
                                    <span className="font-semibold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Errors by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(stats.errors.bySeverity).map(([severity, count]) => (
                                <div key={severity} className="flex justify-between items-center">
                                    <span className="capitalize">{severity}</span>
                                    <span className="font-semibold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Generation Trends (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {stats.generations.dailyTrends.slice(-7).reverse().map((day) => (
                            <div key={day.date} className="flex justify-between items-center text-sm">
                                <span>{new Date(day.date).toLocaleDateString()}</span>
                                <div className="flex gap-4">
                                    <span>Menus: {day.menus}</span>
                                    <span>Meals: {day.meals}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
