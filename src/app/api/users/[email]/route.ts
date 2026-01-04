import { getSupabaseServerClient } from "../../../../../_lib/supabase/server";
import { getUserByEmail, updateUserByEmail, getUserPreferences } from "../../../../../_lib/supabase/queries/users";
import { NextResponse } from "next/server";

// Function to search users by email (unique value)
export async function GET(request: Request, { params }: { params: Promise<{ email: string }> }) {
    const { email } = await params;

    if (!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    try {
        const supabase = getSupabaseServerClient();

        // Get user core data
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Get preferences
        const preferences = await getUserPreferences(user.id);

        return NextResponse.json({
            _id: user.id,
            id: user.id,
            clerkUserId: user.clerk_user_id,
            email: user.email,
            image: user.image || '',
            name: user.name || '',
            age: user.age || 0,
            location: user.location || '',
            dailyCaloriesSuggested: user.daily_calories_suggested || 0,
            goals: user.goals || '',
            dietaryRestrictions: user.dietary_restrictions || '',
            updatesRemaining: user.updates_remaining || 0,
            subscriptionType: user.subscription_type || 'free',
            onboardingCompleted: user.onboarding_completed || false,
            favoriteMeals: preferences?.favoriteMeals || [],
            dislikedMeals: preferences?.dislikedMeals || [],
            ingredients: preferences?.ingredients || [],
            cuisines: preferences?.cuisines || [],
        }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("❌ Error fetching user:", message);
        return NextResponse.json({ message: "Server error", error: message }, { status: 500 });
    }
}

// Function to update user data
export async function PUT(request: Request, { params }: { params: Promise<{ email: string }> }) {
    try {
        const { email } = await params;
        const updateData = await request.json();

        if (!email || !updateData) {
            return NextResponse.json({ message: "Email and update data are required" }, { status: 400 });
        }

        const updatedUser = await updateUserByEmail(email, updateData);

        if (!updatedUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            _id: updatedUser.id,
            id: updatedUser.id,
            clerkUserId: updatedUser.clerkUserId,
            email: updatedUser.email,
            image: updatedUser.image || '',
            name: updatedUser.name || '',
            age: updatedUser.age || 0,
            location: updatedUser.location || '',
            dailyCaloriesSuggested: updatedUser.dailyCaloriesSuggested || 0,
            goals: updatedUser.goals || '',
            dietaryRestrictions: updatedUser.dietaryRestrictions || '',
            updatesRemaining: updatedUser.updatesRemaining || 0,
            subscriptionType: updatedUser.subscriptionType || 'free',
            onboardingCompleted: updatedUser.onboardingCompleted || false,
        }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("❌ Error updating user:", message);
        return NextResponse.json(
            { message: "Failed to update user", error: message },
            { status: 500 }
        );
    }
}

// Function to update a specific field in user data
export async function PATCH(req: Request, { params }: { params: Promise<{ email: string }> }) {
    try {
        const body = await req.json();
        const { key, value } = body;
        const { email } = await params;

        if (!email || !key || value === undefined || value === null) {
            console.error("❌ Missing required fields:", { email, key, value });
            return NextResponse.json({ message: "E-mail, key, and value are required" }, { status: 400 });
        }

        const updatedUser = await updateUserByEmail(email, { [key]: value });

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            _id: updatedUser.id,
            id: updatedUser.id,
            clerkUserId: updatedUser.clerkUserId,
            email: updatedUser.email,
            updatesRemaining: updatedUser.updatesRemaining,
            subscriptionType: updatedUser.subscriptionType,
            onboardingCompleted: updatedUser.onboardingCompleted,
        }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("❌ Error updating user:", message);
        return NextResponse.json({ message: "Error updating user preference", error: message }, { status: 500 });
    }
}

// Handle CORS Preflight Requests
export async function OPTIONS() {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_API_URL || "*",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
    });
}
