import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@lib/adminAuth";
import { getUserById, getUserFullProfile } from "@lib/supabase/queries/users";
import { getSupabaseServerClient } from "@lib/supabase/server";
import { notFound } from "next/navigation";
import UserDetailForm from "./UserDetailForm";

const supabase = getSupabaseServerClient();

async function getUserData(userId: string) {
    const user = await getUserById(userId);
    if (!user) {
        return null;
    }

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

    return {
        user: fullProfile,
        stats: {
            menuGenerations: menuCount.count || 0,
            mealGenerations: mealCount.count || 0,
        },
    };
}

export default async function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const authData = await auth();
    if (!authData.userId) {
        throw new Error('Unauthorized');
    }

    await requireAdmin(authData.userId);

    const { userId } = await params;
    const data = await getUserData(userId);

    if (!data) {
        notFound();
    }

    return <UserDetailForm initialData={data} userId={userId} />;
}
