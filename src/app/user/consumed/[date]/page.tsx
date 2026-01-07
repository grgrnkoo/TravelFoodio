import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../../_lib/supabase/queries/users";
import { getConsumedMealsByDate, getDailyNutritionTotals } from "../../../../../_lib/supabase/queries/consumedMeals";
import { getUserPreferences } from "../../../../../_lib/supabase/queries/preferences";
import Menu from "@/components/Menu";
import ConsumedNutritionBar from "@/components/ConsumedNutritionBar";
import RandomThinkingSvg from "@/components/RandomThinkingSvg";
import type { IMeal } from "@/types";

export default async function ConsumedByDate({ params }: { params: Promise<{ date: string }> }) {
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

    const dateFormatted = date.toISOString().split('T')[0];
    const consumedMeals = await getConsumedMealsByDate(user.id, dateFormatted);
    const nutritionTotals = await getDailyNutritionTotals(user.id, dateFormatted);
    const preferences = await getUserPreferences(user.id);

    if (!consumedMeals || consumedMeals.length === 0) {
        return (
            <>
                <div className="w-full flex justify-center items-center my-12">
                    <RandomThinkingSvg />
                </div>
                <p className="w-full text-center mt-4">No meals consumed on that date</p>
            </>
        )
    }

    // Group consumed meals by name (keep single serving nutrition, not aggregated)
    const mealsMap = new Map<string, IMeal>();
    
    consumedMeals.forEach(meal => {
        // Only add if we haven't seen this meal name before
        // This keeps single-serving nutrition values, not aggregated totals
        if (!mealsMap.has(meal.mealName)) {
            mealsMap.set(meal.mealName, {
                id: meal.id, // Keep first meal's ID for reference
                name: meal.mealName,
                calories: meal.calories,
                protein: meal.protein,
                fats: meal.fats,
                carbs: meal.carbs,
                weight: meal.weight,
                cuisine: meal.cuisine,
                ingredients: meal.ingredients,
                createdAt: meal.consumedAt,
            });
        }
    });

    // Transform to array for Menu component
    const meals: IMeal[] = Array.from(mealsMap.values());

    // Calculate total nutrition
    const totalNutrition = {
        name: "Total Nutrition",
        calories: nutritionTotals.calories,
        protein: nutritionTotals.protein,
        fats: nutritionTotals.fats,
        carbs: nutritionTotals.carbs,
    };

    // Get goals from preferences
    const goals = {
        calories: preferences?.dailyCaloriesSuggested || 2000,
        carbs: preferences?.dailyCarbsSuggested || 250,
        protein: preferences?.dailyProteinsSuggested || 150,
        fat: preferences?.dailyFatsSuggested || 65,
    };

    return (
        <div className="flex flex-col items-center w-full">
            <ConsumedNutritionBar 
                date={dateFormatted}
                goals={goals}
                initialNutrition={nutritionTotals}
            />
            <div className="w-full">
                <Menu
                    content={meals}
                    totalNutrition={totalNutrition}
                    showTotal={false}
                />
            </div>
        </div>
    )
}

