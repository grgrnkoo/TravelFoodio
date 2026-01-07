import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getUserMealPreferences } from "../../../../_lib/supabase/queries/preferences";
import { getFavoriteMealsWithData } from "../../../../_lib/supabase/queries/menus";
import FavoriteMealsList from "./FavoriteMealsList";
import FavoriteMealsSkeleton from "@/components/loadingSkeletons/FavoriteMealsSkeleton";
import type { IMeal } from "@/types";

export const dynamic = 'force-dynamic';

async function FavoriteMealsContent() {
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

    // Get user's favorite meal names from preferences
    const mealPreferences = await getUserMealPreferences(user.id);
    const favoriteMealNames = mealPreferences?.favoriteMeals.map(m => m.name) || [];

    // Lookup strategy:
    // 1. Check meals catalog first - menu meals are automatically saved here via addMealToDb during menu generation
    // 2. Fallback to single_meals table - for user-generated meals (photo analysis, single meal generation)
    // This ensures we can display full meal data (nutrition, ingredients, etc.) for all favorited meals
    const favoriteMeals: IMeal[] = await getFavoriteMealsWithData(user.id, favoriteMealNames);

    return (
        <div className="w-full">
            <FavoriteMealsList meals={favoriteMeals} />
        </div>
    );
}

export default async function FavoriteMealsPage() {
    return (
        <Suspense fallback={<FavoriteMealsSkeleton />}>
            <FavoriteMealsContent />
        </Suspense>
    );
}