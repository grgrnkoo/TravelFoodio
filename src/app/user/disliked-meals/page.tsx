import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getUserMealPreferences } from "../../../../_lib/supabase/queries/preferences";
import { getMealsFromCatalog } from "../../../../_lib/supabase/queries/menus";
import DislikedMealsList from "./DislikedMealsList";
import type { IMeal } from "@/types";

export default async function DislikedMealsPage() {
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
    const dislikedMealNames = mealPreferences?.dislikedMeals.map(m => m.name) || [];

    // Fetch full meal details from catalog
    const dislikedMeals: IMeal[] = dislikedMealNames.length > 0 
        ? await getMealsFromCatalog(dislikedMealNames)
        : [];

    return (
        <div className="w-full">
            <DislikedMealsList meals={dislikedMeals} />
        </div>
    );
}