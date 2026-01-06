import { getSupabaseServerClient } from "../../../../_lib/supabase/server";
import { createUser } from "../../../../_lib/supabase/queries/users";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clerkUserId, email, name, image, onboarding2Completed } = body;

        // Validate required fields
        if (!clerkUserId || !email) {
            return NextResponse.json(
                { error: "clerkUserId and email are required" },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServerClient();

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .or(`clerk_user_id.eq.${clerkUserId},email.eq.${email}`)
            .single();

        if (existingUser) {
            // Update existing user with clerkUserId if they don't have one
            if (!existingUser.clerk_user_id && clerkUserId) {
                const { data: updatedUser, error: updateError } = await supabase
                    .from('users')
                    .update({ clerk_user_id: clerkUserId })
                    .eq('id', existingUser.id)
                    .select()
                    .single();

                if (updateError) {
                    return NextResponse.json({ error: updateError.message }, { status: 500 });
                }
                return NextResponse.json(transformUserResponse(updatedUser), { status: 200 });
            }
            return NextResponse.json(
                { error: "User already exists" },
                { status: 409 }
            );
        }

        // Create new user
        const newUser = await createUser({
            clerkUserId,
            email,
            name: name || '',
            image: image || '',
            onboarding2Completed: onboarding2Completed || false,
        });

        if (!newUser) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        console.log(`✅ Created new user in Supabase: ${email}`);
        return NextResponse.json(transformUserResponse(newUser), { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error creating user:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET() {
    // Fetch all users (admin only in production)
    try {
        const supabase = getSupabaseServerClient();
        const { data: users, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            return NextResponse.json(
                { message: "Failed to fetch users", error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(users?.map(transformUserResponse) || [], { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching users:', message);
        return NextResponse.json(
            { message: "Failed to fetch users", error: message },
            { status: 500 }
        );
    }
}

// Helper function to transform Supabase row to API response format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformUserResponse(user: any) {
    return {
        _id: user.id,
        id: user.id,
        clerkUserId: user.clerk_user_id,
        email: user.email,
        image: user.image || '',
        name: user.name || '',
        updatesRemaining: user.updates_remaining || 0,
        subscriptionType: user.subscription_type || 'free',
        onboarding1Completed: user.onboarding1_completed || false,
        onboarding2Completed: user.onboarding2_completed || false,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        // Preference fields removed - use user_preferences table instead
        // Empty arrays for meal preferences (loaded separately)
        favoriteMeals: [],
        dislikedMeals: [],
        ingredients: [],
        cuisines: [],
    };
}
