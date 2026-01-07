import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkId } from "../_lib/supabase/queries/users";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/feedback",
    "/privacy",
    "/terms",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/sso-callback(.*)",
    "/auth/verify-email(.*)",
    "/auth/error(.*)",
    "/auth/emailsent(.*)",
    "/api/webhooks(.*)",
    "/api/generateOneMeal(.*)",
    "/api/generateResponse(.*)",
    "/api/users/clerk(.*)",
    "/api/users/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
    const pathname = request.nextUrl.pathname;

    // Allow public routes
    if (isPublicRoute(request)) {
        return NextResponse.next();
    }

    // Get auth data
    const { userId, sessionClaims } = await auth();

    // Redirect to sign-in if not authenticated
    if (!userId) {
        console.log("No userId, redirecting to /sign-in.");
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Allow all API routes for authenticated users
    // API routes handle their own authorization logic
    if (pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // Check onboarding status from Clerk public metadata
    // Debug: Log sessionClaims structure to verify path
    console.log("[Proxy] Checking onboarding status for userId:", userId);
    console.log("[Proxy] sessionClaims structure:", JSON.stringify(sessionClaims, null, 2));
    
    // Check if publicMetadata object exists in JWT token
    // Clerk's JWT tokens don't include publicMetadata by default, so we need to check if it exists
    const hasPublicMetadataInJWT = sessionClaims?.publicMetadata !== undefined;
    const hasMetadataInJWT = sessionClaims?.metadata !== undefined;
    
    console.log("[Proxy] Checking for metadata in JWT - hasPublicMetadata:", hasPublicMetadataInJWT, "hasMetadata:", hasMetadataInJWT);
    
    // Try both possible paths: publicMetadata (Clerk standard) and metadata (custom type)
    const onboarding2CompletedFromPublicMetadata = hasPublicMetadataInJWT 
        ? (sessionClaims.publicMetadata as Record<string, unknown>)?.onboarding2Completed as boolean | undefined
        : undefined;
    const onboarding1CompletedFromPublicMetadata = hasPublicMetadataInJWT
        ? (sessionClaims.publicMetadata as Record<string, unknown>)?.onboarding1Completed as boolean | undefined
        : undefined;
    
    const onboarding2CompletedFromMetadata = hasMetadataInJWT
        ? sessionClaims.metadata?.onboarding2Completed as boolean | undefined
        : undefined;
    const onboarding1CompletedFromMetadata = hasMetadataInJWT
        ? sessionClaims.metadata?.onboarding1Completed as boolean | undefined
        : undefined;
    
    let onboarding2Completed = onboarding2CompletedFromPublicMetadata ?? onboarding2CompletedFromMetadata;
    let onboarding1Completed = onboarding1CompletedFromPublicMetadata ?? onboarding1CompletedFromMetadata;
    
    // If metadata is missing from JWT token (which is the default case), fetch directly from Clerk's API
    // This ensures we always have the latest metadata values without waiting for JWT refresh
    if (!hasPublicMetadataInJWT && !hasMetadataInJWT) {
        console.log("[Proxy] publicMetadata not found in JWT token, fetching directly from Clerk API");
        try {
            const clerk = await clerkClient();
            const clerkUser = await clerk.users.getUser(userId);
            const publicMetadata = (clerkUser.publicMetadata as Record<string, unknown>) || {};
            
            onboarding1Completed = publicMetadata.onboarding1Completed as boolean | undefined;
            onboarding2Completed = publicMetadata.onboarding2Completed as boolean | undefined;
            
            console.log("[Proxy] ✅ Fetched metadata from Clerk API:", {
                onboarding1Completed,
                onboarding2Completed,
                fullMetadata: publicMetadata
            });
        } catch (clerkError) {
            console.error("[Proxy] ❌ Error fetching metadata from Clerk API:", clerkError);
            // Continue with undefined values - will fall back to database below
        }
    } else {
        console.log("[Proxy] Using metadata from JWT token");
        console.log("[Proxy] Clerk metadata - onboarding1Completed:", onboarding1Completed, "onboarding2Completed:", onboarding2Completed);
        console.log("[Proxy] publicMetadata path values:", { onboarding1CompletedFromPublicMetadata, onboarding2CompletedFromPublicMetadata });
        console.log("[Proxy] metadata path values:", { onboarding1CompletedFromMetadata, onboarding2CompletedFromMetadata });
    }
    
    // If Clerk metadata is still unavailable or incomplete, fall back to database
    // This handles cases where:
    // 1. Metadata fetch from Clerk API failed
    // 2. Metadata is incomplete (one flag missing)
    const needsDbFallback = 
        (onboarding2Completed === undefined && onboarding1Completed === undefined) ||
        (onboarding2Completed === undefined && onboarding1Completed === true) ||
        (onboarding1Completed === undefined && onboarding2Completed === true);
    
    if (needsDbFallback) {
        console.log("[Proxy] Clerk metadata unavailable or incomplete, falling back to database check");
        try {
            const userFromDb = await getUserByClerkId(userId);
            if (userFromDb) {
                // Use database values, but prefer Clerk metadata if it exists
                onboarding1Completed = onboarding1Completed ?? userFromDb.onboarding1Completed ?? false;
                onboarding2Completed = onboarding2Completed ?? userFromDb.onboarding2Completed ?? false;
                console.log("[Proxy] Database fallback - onboarding1Completed:", onboarding1Completed, "onboarding2Completed:", onboarding2Completed);
            } else {
                console.log("[Proxy] User not found in database, defaulting to not onboarded");
                onboarding1Completed = onboarding1Completed ?? false;
                onboarding2Completed = onboarding2Completed ?? false;
            }
        } catch (dbError) {
            console.error("[Proxy] Error fetching user from database:", dbError);
            // Default to not onboarded if DB check fails, but keep any Clerk metadata we have
            onboarding1Completed = onboarding1Completed ?? false;
            onboarding2Completed = onboarding2Completed ?? false;
        }
    }
    
    const isOnboardingPath = pathname.startsWith("/user/onboarding");
    console.log("[Proxy] Final onboarding status - onboarding1Completed:", onboarding1Completed, "onboarding2Completed:", onboarding2Completed, "isOnboardingPath:", isOnboardingPath);

    // If both steps are completed, redirect away from onboarding pages
    if (onboarding2Completed && onboarding1Completed && isOnboardingPath) {
        console.log("User already onboarded, redirecting to home.");
        return NextResponse.redirect(new URL("/user", request.url));
    }

    // If step 1 is completed but step 2 is not, ensure user is on result page
    // This check must come before the general "not onboarded" check
    if (!onboarding2Completed && onboarding1Completed) {
        const isResultPath = pathname === "/user/onboarding/result";
        if (!isResultPath) {
            console.log("User has completed first step of onboarding, redirecting to result.");
            return NextResponse.redirect(new URL("/user/onboarding/result", request.url));
        }
        // Allow access to result page
        return NextResponse.next();
    }

    // Redirect users who haven't finished onboarding (neither step completed)
    // Allow access to onboarding pages
    if ((!onboarding2Completed || !onboarding1Completed) && !isOnboardingPath) {
        console.log("User not onboarded, redirecting to onboarding.");
        return NextResponse.redirect(new URL("/user/onboarding", request.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};

