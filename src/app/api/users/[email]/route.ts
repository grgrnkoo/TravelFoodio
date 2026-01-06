import { getSupabaseServerClient } from "../../../../../_lib/supabase/server";
import { getUserByEmail, updateUserByEmail } from "../../../../../_lib/supabase/queries/users";
import { getUserMealPreferences, getUserMenuPreferences, updateUserPreferences } from "../../../../../_lib/supabase/queries/preferences";
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

        // Get preferences (meal/ingredient/cuisine preferences)
        const preferences = await getUserMealPreferences(user.id);
        // Get menu preferences
        const menuPreferences = await getUserMenuPreferences(user.id);

        return NextResponse.json({
            _id: user.id,
            id: user.id,
            clerkUserId: user.clerk_user_id,
            email: user.email,
            image: user.image || '',
            name: user.name || '',
            age: menuPreferences?.age || 0,
            weight: menuPreferences?.weight || '',
            height: menuPreferences?.height || '',
            medicalRecommendations: menuPreferences?.medicalRecommendations || [],
            otherInfo: menuPreferences?.otherInfo || '',
            location: menuPreferences?.location || '',
            dailyCaloriesSuggested: menuPreferences?.dailyCaloriesSuggested || 0,
            goals: menuPreferences?.goals || '',
            dietaryRestrictions: menuPreferences?.dietaryRestrictions || '',
            dateOfBirth: menuPreferences?.dateOfBirth || undefined,
            updatesRemaining: user.updates_remaining || 0,
            subscriptionType: user.subscription_type || 'free',
            onboarding1Completed: user.onboarding1_completed || false,
            onboarding2Completed: user.onboarding2_completed || false,
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

        // Get menu preferences for response
        const menuPreferences = await getUserMenuPreferences(updatedUser.id);

        return NextResponse.json({
            _id: updatedUser.id,
            id: updatedUser.id,
            clerkUserId: updatedUser.clerkUserId,
            email: updatedUser.email,
            image: updatedUser.image || '',
            name: updatedUser.name || '',
            age: menuPreferences?.age || 0,
            location: menuPreferences?.location || '',
            dailyCaloriesSuggested: menuPreferences?.dailyCaloriesSuggested || 0,
            goals: menuPreferences?.goals || '',
            dietaryRestrictions: menuPreferences?.dietaryRestrictions || '',
            updatesRemaining: updatedUser.updatesRemaining || 0,
            subscriptionType: updatedUser.subscriptionType || 'free',
            onboarding1Completed: updatedUser.onboarding1Completed || false,
            onboarding2Completed: updatedUser.onboarding2Completed || false,
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

        const supabase = getSupabaseServerClient();
        
        // Get user to find user ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Define core user fields (in users table)
        const coreUserFields = ['name', 'image', 'email', 'updatesRemaining', 'subscriptionType', 'onboarding1Completed', 'onboarding2Completed'];
        
        // Define preference fields (in user_preferences table)
        const preferenceFields = ['age', 'weight', 'height', 'medicalRecommendations', 'otherInfo', 'dailyCaloriesSuggested', 'location', 'goals', 'dietaryRestrictions', 'dateOfBirth'];

        let updatedUser;

        if (coreUserFields.includes(key)) {
            // Update core user field
            updatedUser = await updateUserByEmail(email, { [key]: value });
            if (!updatedUser) {
                return NextResponse.json({ message: "User not found" }, { status: 404 });
            }
        } else if (preferenceFields.includes(key)) {
            // Update preference field
            const prefUpdate: Record<string, unknown> = { [key]: value };
            
            // Handle special case for medicalRecommendations (ensure it's an array)
            if (key === 'medicalRecommendations') {
                prefUpdate[key] = Array.isArray(value) ? value : [];
            }
            
            const updatedPreferences = await updateUserPreferences(user.id, prefUpdate);
            if (!updatedPreferences) {
                return NextResponse.json({ message: "Failed to update preferences" }, { status: 500 });
            }
            
            // Get updated user data
            updatedUser = await getUserByEmail(email);
            if (!updatedUser) {
                return NextResponse.json({ message: "User not found" }, { status: 404 });
            }
        } else {
            return NextResponse.json({ message: `Unknown field: ${key}` }, { status: 400 });
        }

        // Get menu preferences for response
        const menuPreferences = await getUserMenuPreferences(user.id);

        return NextResponse.json({
            _id: updatedUser.id,
            id: updatedUser.id,
            clerkUserId: updatedUser.clerkUserId,
            email: updatedUser.email,
            name: updatedUser.name || '',
            image: updatedUser.image || '',
            age: menuPreferences?.age || 0,
            weight: menuPreferences?.weight || '',
            height: menuPreferences?.height || '',
            medicalRecommendations: menuPreferences?.medicalRecommendations || [],
            otherInfo: menuPreferences?.otherInfo || '',
            dailyCaloriesSuggested: menuPreferences?.dailyCaloriesSuggested || 0,
            location: menuPreferences?.location || '',
            goals: menuPreferences?.goals || '',
            dietaryRestrictions: menuPreferences?.dietaryRestrictions || '',
            dateOfBirth: menuPreferences?.dateOfBirth || undefined,
            updatesRemaining: updatedUser.updatesRemaining,
            subscriptionType: updatedUser.subscriptionType,
            onboarding1Completed: updatedUser.onboarding1Completed,
            onboarding2Completed: updatedUser.onboarding2Completed,
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
