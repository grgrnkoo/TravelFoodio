import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "../../../../../_lib/supabase/server";
import { updateUserById } from "../../../../../_lib/supabase/queries/users";

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

        // Update the user's daily calorie suggestion
        const updatedUser = await updateUserById(id, {
            dailyCaloriesSuggested: dailyKcalSuggested,
        });

        if (!updatedUser) {
            throw new Error('Error while saving data');
        }

        return NextResponse.json({ success: true, message: 'User data saved successfully' });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message });
        } else {
            return NextResponse.json({ success: false, error: 'An unknown error occurred' });
        }
    }
}
