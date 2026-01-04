import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "../../../../../_lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const stepToUpdate = await req.json();
    const stringifiedStep = stepToUpdate.toString();

    // Verify user is authenticated with Clerk
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log('Updating onboarding step: ', stringifiedStep);

    if (typeof stringifiedStep !== 'string') {
        throw new Error('Invalid step data');
    }

    try {
        if (!id) {
            throw new Error('No ID provided');
        }

        const supabase = getSupabaseServerClient();

        if (stringifiedStep === '1') {
            const { data, error } = await supabase
                .from('users')
                .update({ onboarding_completed: false }) // Step 1 doesn't complete onboarding
                .eq('id', id)
                .select()
                .single();

            if (error || !data) {
                throw new Error("Error updating onboarding step 1");
            }

            console.log("Updated User in DB:", data);

        } else if (stringifiedStep === '2') {
            // When step 2 is completed, mark the full onboarding as complete
            const { data, error } = await supabase
                .from('users')
                .update({ onboarding_completed: true })
                .eq('id', id)
                .select()
                .single();

            if (error || !data) {
                throw new Error("Error updating onboarding step 2");
            }

            console.log("Updated User in DB:", data);
        } else {
            throw new Error('Wrong step provided');
        }

        return NextResponse.json({
            status: 200,
            message: 'Onboarding step updated successfully',
            trigger: 'update'
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
        }
    }
}
