import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../../_lib/supabase/queries/users";
import { getMenuByDate } from "../../../../../_lib/supabase/queries/menus";
import { getSingleMealsByDate } from "../../../../../_lib/supabase/queries/singleMeals";
import Menu from "@/components/Menu";
import RandomThinkingSvg from "@/components/RandomThinkingSvg";
import type { TotalNutrition } from "@/types";

interface HistoryByDateProps {
    params: Promise<{ date: string }>;
    searchParams: Promise<{ type?: string }>;
}

export default async function HistoryByDate({ params, searchParams }: HistoryByDateProps) {
    const awaitedParams = await params;
    const awaitedSearchParams = await searchParams;
    const dateString = awaitedParams.date;
    const type = awaitedSearchParams.type || 'menus';

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

    let meals: Array<{ id?: string; name: string; calories?: number; protein?: number; fats?: number; carbs?: number; weight?: number; cuisine?: string; ingredients?: string[] }> = [];
    let emptyMessage = '';

    if (type === 'menus') {
        const menuData = await getMenuByDate(user.id, date);
        if (menuData && menuData.meals && menuData.meals.length > 0) {
            meals = menuData.meals;
        } else {
            emptyMessage = 'No menu generated on that date';
        }
    } else if (type === 'single-meals') {
        const singleMeals = await getSingleMealsByDate(user.id, date, 'prompt');
        if (singleMeals && singleMeals.length > 0) {
            meals = singleMeals;
        } else {
            emptyMessage = 'No single meals generated on that date';
        }
    } else if (type === 'photo-analysis') {
        const photoMeals = await getSingleMealsByDate(user.id, date, 'photo');
        if (photoMeals && photoMeals.length > 0) {
            meals = photoMeals;
        } else {
            emptyMessage = 'No photo analyses on that date';
        }
    }

    if (meals.length === 0) {
        return (
            <>
                <div className="w-full flex justify-center items-center my-12">
                    <RandomThinkingSvg />
                </div>
                <p className="w-full text-center mt-4">{emptyMessage}</p>
            </>
        )
    }

    // Only calculate and show total nutrition for menus
    const showTotal = type === 'menus';
    const totalNutrition: TotalNutrition = showTotal
        ? meals.reduce<TotalNutrition>(
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
        )
        : { name: "", calories: 0, protein: 0, fats: 0, carbs: 0 };

    return (
        <div>
            <Menu
                content={meals}
                totalNutrition={totalNutrition}
                showTotal={showTotal}
            />
        </div>
    )
}