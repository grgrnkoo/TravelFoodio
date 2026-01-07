import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getUserMealPreferences } from "../../../../_lib/supabase/queries/preferences";
import { getFavoriteMealsWithData } from "../../../../_lib/supabase/queries/menus";
import DislikedMealsList from "./DislikedMealsList";
import DislikedMealsSkeleton from "@/components/loadingSkeletons/DislikedMealsSkeleton";
import type { IMeal } from "@/types";

export const dynamic = 'force-dynamic';

async function DislikedMealsContent() {
    const { userId } = await auth();
    
    if (!userId) {
        return (
            <div className="w-full">
                <p className="text-center text-muted-foreground">Not authenticated</p>
            </div>
        );
    }

    const user = await ensureUserExists(userId);
    if (!user) {
        return (
            <div className="w-full">
                <p className="text-center text-muted-foreground">User not found</p>
            </div>
        );
    }

    // Get user's disliked meal names from preferences
    const mealPreferences = await getUserMealPreferences(user.id);
    const dislikedMealNames = mealPreferences?.dislikedMeals.map(m => m.name) || [];

    // Lookup strategy: same as favorite meals - check catalog first, then single_meals
    const dislikedMeals: IMeal[] = await getFavoriteMealsWithData(user.id, dislikedMealNames);

    return (
        <div className="w-full">
            <DislikedMealsList meals={dislikedMeals} />
        </div>
    );
}

export default async function DislikedMealsPage() {
    return (
        <Suspense fallback={<DislikedMealsSkeleton />}>
            <DislikedMealsContent />
        </Suspense>
    );
}