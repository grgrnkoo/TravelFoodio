import { getUserFullProfile, updateUserByClerkId } from "../../../../../../_lib/supabase/queries/users";
import { getUserMenuPreferences } from "../../../../../../_lib/supabase/queries/preferences";
import { NextResponse } from "next/server";

// Function to get user by clerkUserId
export async function GET(request: Request, { params }: { params: Promise<{ clerkUserId: string }> }) {
    console.log("[users/clerk] GET request received");

    try {
        const { clerkUserId } = await params;
        console.log("[users/clerk] Clerk User ID:", clerkUserId);

        if (!clerkUserId) {
            console.error("[users/clerk] No clerkUserId provided");
            return NextResponse.json(
                { message: "Clerk User ID is required" },
                { status: 400 }
            );
        }

        console.log("[users/clerk] Fetching user from Supabase...");

        // Get full user profile with preferences
        const userProfile = await getUserFullProfile(clerkUserId);

        if (!userProfile) {
            console.log("[users/clerk] User not found in database");
            return NextResponse.json(
                { message: "User not found. Please sign up or sync your account." },
                { status: 404 }
            );
        }

        console.log("[users/clerk] User found successfully");
        return NextResponse.json({
            _id: userProfile.id,
            id: userProfile.id,
            clerkUserId: userProfile.clerkUserId,
            email: userProfile.email,
            image: userProfile.image || '',
            name: userProfile.name || '',
            age: userProfile.age || 0,
            location: userProfile.location || '',
            dailyCaloriesSuggested: userProfile.dailyCaloriesSuggested || 0,
            goals: userProfile.goals || '',
            dietaryRestrictions: userProfile.dietaryRestrictions || '',
            updatesRemaining: userProfile.updatesRemaining || 0,
            subscriptionType: userProfile.subscriptionType || 'free',
            onboarding1Completed: userProfile.onboarding1Completed || false,
            onboarding2Completed: userProfile.onboarding2Completed || false,
            favoriteMeals: userProfile.favoriteMeals || [],
            dislikedMeals: userProfile.dislikedMeals || [],
            ingredients: userProfile.ingredients || [],
            cuisines: userProfile.cuisines || [],
        }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        console.error("[users/clerk] ❌ Error fetching user by clerkUserId:", message);
        console.error("[users/clerk] Stack trace:", stack);
        return NextResponse.json(
            { message: "Server error", error: message },
            { status: 500 }
        );
    }
}

// Update user by clerkUserId
export async function PATCH(request: Request, { params }: { params: Promise<{ clerkUserId: string }> }) {
    try {
        const { clerkUserId } = await params;
        const body = await request.json();

        if (!clerkUserId) {
            return NextResponse.json(
                { message: "Clerk User ID is required" },
                { status: 400 }
            );
        }

        const updatedUser = await updateUserByClerkId(clerkUserId, body);

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
            { message: "Server error", error: message },
            { status: 500 }
        );
    }
}
