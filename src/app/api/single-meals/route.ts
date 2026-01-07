import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getSingleMealsByDate } from "../../../../_lib/supabase/queries/singleMeals";

export async function GET(req: NextRequest) {
    try {
        // Check authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await ensureUserExists(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get query parameters
        const searchParams = req.nextUrl.searchParams;
        const dateParam = searchParams.get('date');
        const sourceParam = searchParams.get('source') as 'photo' | 'prompt' | null;

        if (!dateParam) {
            return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
        }

        // Parse date
        const date = new Date(dateParam);
        if (isNaN(date.getTime())) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        // Validate source if provided
        if (sourceParam && sourceParam !== 'photo' && sourceParam !== 'prompt') {
            return NextResponse.json({ error: "Invalid source parameter. Must be 'photo' or 'prompt'" }, { status: 400 });
        }

        // Fetch meals
        const meals = await getSingleMealsByDate(user.id, date, sourceParam || undefined);

        return NextResponse.json({ success: true, meals });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("[single-meals] Error:", message);
        return NextResponse.json({ 
            error: "Failed to fetch meals", 
            details: message 
        }, { status: 500 });
    }
}

