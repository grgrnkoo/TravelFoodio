import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "../../../../_lib/supabase/queries/users";
import { getPhotoAnalysisCount } from "../../../../_lib/supabase/queries/photoAnalyses";

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

        const today = new Date().toISOString().split('T')[0];
        const count = await getPhotoAnalysisCount(user.id, today);

        return NextResponse.json({ 
            success: true, 
            count,
            remaining: Math.max(0, 3 - count)
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[photo-analyses] Error:', message);
        return NextResponse.json({ 
            error: "Failed to fetch photo analysis count",
            details: message 
        }, { status: 500 });
    }
}

