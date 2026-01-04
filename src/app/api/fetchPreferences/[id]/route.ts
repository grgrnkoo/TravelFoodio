import { NextRequest, NextResponse } from "next/server";
import { getUserPreferences } from "../../../../../_lib/supabase/queries/preferences";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const preferences = await getUserPreferences(id);

        if (!preferences) {
            console.error('no preferences found');
            return NextResponse.json({
                status: 404,
                message: 'No matching preferences found'
            })
        }

        console.log('data: ', preferences);

        return NextResponse.json({
            status: 200,
            data: JSON.stringify(preferences),
            message: 'Preferences fetched successfully',
        })
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching preferences: ', error.message)
            return NextResponse.json({ error: `Error fetching preferences: ${error.message}` })
        } else {
            return NextResponse.json({ error: 'Unknown error fetching preferences' })
        }
    }
}
