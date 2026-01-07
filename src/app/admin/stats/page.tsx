import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@lib/adminAuth";
import { getSupabaseServerClient } from "@lib/supabase/server";
import { getErrorStats } from "@lib/supabase/queries/errorLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

async function getStats() {
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

        const [menuResult, mealCount] = await Promise.all([
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
            meals: mealCount,
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

export default async function AdminStatsPage() {
    const authData = await auth();
    if (!authData.userId) {
        throw new Error('Unauthorized');
    }

    await requireAdmin(authData.userId);

    const stats = await getStats();

    // Calculate max value for chart scaling
    const maxGenerationValue = Math.max(
        ...stats.generations.dailyTrends.map((d) => d.menus + d.meals),
        1
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Statistics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Users by Subscription Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats.users.bySubscriptionType).map(([type, count]) => {
                                const percentage = (count / stats.users.total) * 100;
                                return (
                                    <div key={type}>
                                        <div className="flex justify-between mb-1">
                                            <span className="capitalize font-medium">{type}</span>
                                            <span className="text-muted-foreground">
                                                {count} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Errors by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats.errors.bySeverity).map(([severity, count]) => {
                                const percentage = stats.errors.total > 0
                                    ? (count / stats.errors.total) * 100
                                    : 0;
                                return (
                                    <div key={severity}>
                                        <div className="flex justify-between mb-1">
                                            <span className="capitalize font-medium">{severity}</span>
                                            <span className="text-muted-foreground">
                                                {count} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-destructive h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daily Generation Trends (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {stats.generations.dailyTrends.map((day) => {
                            const total = day.menus + day.meals;
                            const percentage = (total / maxGenerationValue) * 100;
                            return (
                                <div key={day.date} className="flex items-center gap-4">
                                    <div className="w-24 text-sm text-muted-foreground">
                                        {new Date(day.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                    <div className="flex-1 flex gap-1">
                                        <div
                                            className="bg-primary h-6 rounded flex items-center justify-end pr-2 text-xs text-primary-foreground"
                                            style={{ width: `${percentage}%` }}
                                        >
                                            {total > 0 && total}
                                        </div>
                                    </div>
                                    <div className="w-32 text-sm text-muted-foreground text-right">
                                        {day.menus}M / {day.meals}m
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.users.total}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {stats.users.active} active (30 days)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Total Generations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {stats.generations.totalMenus + stats.generations.totalMeals}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {stats.generations.totalMenus} menus, {stats.generations.totalMeals} meals
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Total Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.errors.total}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {stats.errors.unresolved} unresolved
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
