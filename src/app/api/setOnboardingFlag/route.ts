import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "../../../../_lib/supabase/server";

export async function PATCH(req: NextRequest) {
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
        const supabase = getSupabaseServerClient();

        // Get user from database using authenticated Clerk userId
        // This ensures we're updating the correct user without relying on client-provided IDs
        const { data: authenticatedUser, error: userError } = await supabase
            .from('users')
            .select('id, clerk_user_id')
            .eq('clerk_user_id', userId)
            .single();

        if (userError || !authenticatedUser) {
            throw new Error("User not found in database");
        }

        const userId_db = authenticatedUser.id;
        const clerkUserId = authenticatedUser.clerk_user_id;

        if (stringifiedStep === '1') {
            // Step 1: User has saved preferences
            const { data, error } = await supabase
                .from('users')
                .update({ onboarding1_completed: true })
                .eq('clerk_user_id', userId)
                .select()
                .single();

            if (error || !data) {
                throw new Error("Error updating onboarding step 1");
            }

            console.log("Updated User in DB (Step 1):", data);

            // Update Clerk metadata for step 1 so middleware can check it
            try {
                const clerk = await clerkClient();
                await clerk.users.updateUserMetadata(clerkUserId, {
                    publicMetadata: {
                        onboarding1Completed: true
                    }
                });
                console.log("Updated Clerk metadata (Step 1)");
            } catch (clerkError) {
                console.error("Error updating Clerk metadata:", clerkError);
                // Don't fail the request if Clerk update fails
            }

        } else if (stringifiedStep === '2') {
            // Step 2: User has completed AI recommendations and finalized onboarding
            const { data, error } = await supabase
                .from('users')
                .update({ 
                    onboarding2_completed: true
                })
                .eq('clerk_user_id', userId)
                .select()
                .single();

            if (error || !data) {
                throw new Error("Error updating onboarding step 2");
            }

            console.log("Updated User in DB (Step 2 - Onboarding Complete):", data);

            // Update Clerk metadata - step 2 completes onboarding
            // Include both flags to ensure middleware has correct state
            try {
                const clerk = await clerkClient();
                await clerk.users.updateUserMetadata(clerkUserId, {
                    publicMetadata: {
                        onboarding1Completed: true,
                        onboarding2Completed: true
                    }
                });
                console.log("Updated Clerk metadata (Step 2 - Onboarding Complete)");
                console.log("Note: Client session cookie will need to be refreshed to reflect updated metadata");
            } catch (clerkError) {
                console.error("Error updating Clerk metadata:", clerkError);
                // Don't fail the request if Clerk update fails - database fallback will handle it
            }
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

