import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../../_lib/supabase/queries/users";
import { getMenuByDate } from "../../../../../_lib/supabase/queries/menus";
import Menu from "@/components/Menu";
import RandomThinkingSvg from "@/components/RandomThinkingSvg";
import type { TotalNutrition } from "@/types";

export default async function HistoryByDate({ params }: { params: Promise<{ date: string }> }) {
    const awaitedParams = await params;
    const dateString = awaitedParams.date;

    const { userId } = await auth();
    if (!userId) return <div>Not authenticated</div>
    
    const user = await ensureUserExists(userId);
    if (!user) return <div>User not found</div>

    // Parse the date string (format: YYYY-MM-DD)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return (
            <>
                <div className="w-full flex justify-center items-center my-12">
                    <RandomThinkingSvg />
                </div>
                <p className="w-full text-center mt-4">Invalid date format</p>
            </>
        )
    }

    const menuData = await getMenuByDate(user.id, date);

    if (!menuData || !menuData.meals || menuData.meals.length === 0) {
        return (
            <>
                <div className="w-full flex justify-center items-center my-12">
                    <RandomThinkingSvg />
                </div>
                <p className="w-full text-center mt-4">No menu generated on that date</p>
            </>
        )
    }

    const meals = menuData.meals;

    const totalNutrition: TotalNutrition = meals.reduce<TotalNutrition>(
        (totals, meal) => {
            return {
                name: "Total Nutrition",
                calories: totals.calories + (meal.calories ?? 0),
                protein: totals.protein + (meal.protein ?? 0),
                fats: totals.fats + (meal.fats ?? 0),
                carbs: totals.carbs + (meal.carbs ?? 0),
            };
        },
        { name: "", calories: 0, protein: 0, fats: 0, carbs: 0 }
    );

    return (
        <div>
            <Menu
                content={meals}
                totalNutrition={totalNutrition}
                showTotal={true}
            />
        </div>
    )
}