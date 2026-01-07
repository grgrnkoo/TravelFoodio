import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { ensureUserExists } from "../../../../_lib/supabase/queries/users"
import { 
    addConsumedMeal, 
    getConsumedMealsByDate, 
    removeConsumedMeal,
    getConsumedMealsCount 
} from "../../../../_lib/supabase/queries/consumedMeals"

export async function POST(req: NextRequest) {
    try {
        const authData = await auth()
        if (!authData.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await ensureUserExists(authData.userId)
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const body = await req.json()
        const { mealName, calories, protein, fats, carbs, weight, cuisine, ingredients } = body

        if (!mealName) {
            return NextResponse.json({ error: "Meal name is required" }, { status: 400 })
        }

        // Check 10-per-day limit
        const today = new Date().toISOString().split('T')[0]
        const count = await getConsumedMealsCount(user.id, mealName, today)
        
        if (count >= 10) {
            return NextResponse.json(
                { error: "Maximum 10 entries per meal per day reached" },
                { status: 400 }
            )
        }

        const consumedMeal = await addConsumedMeal(user.id, {
            mealName,
            calories,
            protein,
            fats,
            carbs,
            weight,
            cuisine,
            ingredients,
        })

        if (!consumedMeal) {
            return NextResponse.json({ error: "Failed to add consumed meal" }, { status: 500 })
        }

        return NextResponse.json({ success: true, meal: consumedMeal }, { status: 201 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error adding consumed meal:', message)
        return NextResponse.json({ error: "Error adding consumed meal", message }, { status: 500 })
    }
}

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

        const meals = await getConsumedMealsByDate(user.id, date)

        return NextResponse.json({ success: true, meals }, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error fetching consumed meals:', message)
        return NextResponse.json({ error: "Error fetching consumed meals", message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
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
        const mealId = searchParams.get('id')

        if (!mealId) {
            return NextResponse.json({ error: "Meal ID is required" }, { status: 400 })
        }

        const success = await removeConsumedMeal(user.id, mealId)

        if (!success) {
            return NextResponse.json({ error: "Failed to remove consumed meal" }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error removing consumed meal:', message)
        return NextResponse.json({ error: "Error removing consumed meal", message }, { status: 500 })
    }
}

