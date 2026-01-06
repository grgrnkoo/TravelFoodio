import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getUserMealPreferences } from "../../../../_lib/supabase/queries/preferences";
import { getMealsFromCatalog } from "../../../../_lib/supabase/queries/menus";
import FavoriteMealsList from "./FavoriteMealsList";
import type { IMeal } from "@/types";

export default async function FavoriteMealsPage() {
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
    const favoriteMealNames = mealPreferences?.favoriteMeals.map(m => m.name) || [];

    // Fetch full meal details from catalog
    const favoriteMeals: IMeal[] = favoriteMealNames.length > 0 
        ? await getMealsFromCatalog(favoriteMealNames)
        : [];

    return (
        <div className="w-full">
            <FavoriteMealsList meals={favoriteMeals} />
        </div>
    );
}