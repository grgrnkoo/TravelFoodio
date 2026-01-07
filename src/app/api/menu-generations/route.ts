import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists, resetUpdatesRemainingIfNeeded } from "../../../../_lib/supabase/queries/users";

export async function GET(req: NextRequest) {
    try {
        const authData = await auth();
        if (!authData.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await ensureUserExists(authData.userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Reset updates_remaining if needed (if no menus today) and get current count
        const result = await resetUpdatesRemainingIfNeeded(user.id);

        if (!result.success) {
            return NextResponse.json({ 
                error: "Failed to fetch menu generation count",
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            remaining: result.updatesRemaining,
            dailyLimit: result.dailyLimit
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[menu-generations] Error:', message);
        return NextResponse.json({ 
            error: "Failed to fetch generation count",
            details: message 
        }, { status: 500 });
    }
}

