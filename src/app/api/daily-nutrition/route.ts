import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { ensureUserExists } from "../../../../_lib/supabase/queries/users"
import { getDailyNutritionTotals } from "../../../../_lib/supabase/queries/consumedMeals"
import { getUserPreferences } from "../../../../_lib/supabase/queries/preferences"

export async function GET(req: NextRequest) {
    try {
        const authData = await auth()
        if (!authData.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await ensureUserExists(authData.userId)
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const { searchParams } = new URL(req.url)
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

        // Get consumed nutrition totals
        const consumed = await getDailyNutritionTotals(user.id, date)

        // Get user preferences for goals
        const preferences = await getUserPreferences(user.id)

        return NextResponse.json({
            success: true,
            consumed: {
                calories: consumed.calories,
                carbs: consumed.carbs,
                protein: consumed.protein,
                fat: consumed.fats,
            },
            goals: {
                calories: preferences?.dailyCaloriesSuggested || 0,
                carbs: preferences?.dailyCarbsSuggested || 0,
                protein: preferences?.dailyProteinsSuggested || 0,
                fat: preferences?.dailyFatsSuggested || 0,
            },
        }, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error fetching daily nutrition:', message)
        return NextResponse.json({ error: "Error fetching daily nutrition", message }, { status: 500 })
    }
}

