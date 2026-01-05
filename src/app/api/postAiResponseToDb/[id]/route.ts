import { NextRequest, NextResponse } from "next/server"
import { upsertUserPreferences } from "../../../../../_lib/supabase/queries/preferences";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const {
        dailyKcalSuggested,
        dailyCarbsSuggested,
        dailyProteinsSuggested,
        dailyFatsSuggested
    } = await req.json();

    try {
        if (!id) {
            throw new Error('No ID provided');
        }

        if (!dailyKcalSuggested || !dailyCarbsSuggested || !dailyProteinsSuggested || !dailyFatsSuggested) {
            throw new Error('Required data missing')
        }

        console.log('post data: ', dailyKcalSuggested, dailyFatsSuggested, dailyProteinsSuggested, dailyCarbsSuggested)

        // Update the user's daily calorie suggestion in preferences
        const preferences = await upsertUserPreferences(id, {
            dailyCaloriesSuggested: dailyKcalSuggested,
        });

        if (!preferences) {
            throw new Error('Error while saving preferences');
        }

        return NextResponse.json({ success: true, message: 'User preferences saved successfully' });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message });
        } else {
            return NextResponse.json({ success: false, error: 'An unknown error occurred' });
        }
    }
}
