import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getUserMealPreferences } from "../../../../_lib/supabase/queries/preferences";
import CuisinesList from "./CuisinesList";
import CuisinesSkeleton from "@/components/loadingSkeletons/CuisinesSkeleton";
import type { IUserCuisine } from "@/types";

export const dynamic = 'force-dynamic';

async function CuisinesContent() {
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
    const cuisines = mealPreferences?.cuisines || [];

    // Sort cuisines by rating (highest to lowest)
    const sortedCuisines: IUserCuisine[] = [...cuisines].sort((a, b) => b.rating - a.rating);

    return (
        <div className="w-full">
            <CuisinesList cuisines={sortedCuisines} />
        </div>
    );
}

export default async function CuisinesPage() {
    return (
        <Suspense fallback={<CuisinesSkeleton />}>
            <CuisinesContent />
        </Suspense>
    );
}