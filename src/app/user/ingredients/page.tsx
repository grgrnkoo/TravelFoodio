import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getUserMealPreferences } from "../../../../_lib/supabase/queries/preferences";
import IngredientsList from "./IngredientsList";
import IngredientsSkeleton from "@/components/loadingSkeletons/IngredientsSkeleton";
import type { IUserIngredient } from "@/types";

async function IngredientsContent() {
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

    const mealPreferences = await getUserMealPreferences(user.id);
    const ingredients = mealPreferences?.ingredients || [];

    // Sort ingredients by rating (highest to lowest)
    const sortedIngredients: IUserIngredient[] = [...ingredients].sort((a, b) => b.rating - a.rating);

    return (
        <div className="w-full">
            <IngredientsList ingredients={sortedIngredients} />
        </div>
    );
}

export default async function IngredientsPage() {
    return (
        <Suspense fallback={<IngredientsSkeleton />}>
            <IngredientsContent />
        </Suspense>
    );
}