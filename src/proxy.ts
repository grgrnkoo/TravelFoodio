import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
    
    // Try both possible paths: publicMetadata (Clerk standard) and metadata (custom type)
    const onboarding2CompletedFromPublicMetadata = (sessionClaims?.publicMetadata as Record<string, unknown>)?.onboarding2Completed as boolean | undefined;
    const onboarding1CompletedFromPublicMetadata = (sessionClaims?.publicMetadata as Record<string, unknown>)?.onboarding1Completed as boolean | undefined;
    
    const onboarding2CompletedFromMetadata = sessionClaims?.metadata?.onboarding2Completed as boolean | undefined;
    const onboarding1CompletedFromMetadata = sessionClaims?.metadata?.onboarding1Completed as boolean | undefined;
    
    // Use whichever path has values, prefer publicMetadata (Clerk standard)
    let onboarding2Completed = onboarding2CompletedFromPublicMetadata ?? onboarding2CompletedFromMetadata;
    let onboarding1Completed = onboarding1CompletedFromPublicMetadata ?? onboarding1CompletedFromMetadata;
    
    console.log("[Proxy] Clerk metadata - onboarding1Completed:", onboarding1Completed, "onboarding2Completed:", onboarding2Completed);
    console.log("[Proxy] publicMetadata path values:", { onboarding1CompletedFromPublicMetadata, onboarding2CompletedFromPublicMetadata });
    console.log("[Proxy] metadata path values:", { onboarding1CompletedFromMetadata, onboarding2CompletedFromMetadata });
    
    // If Clerk metadata is unavailable or incomplete, fall back to database
    // This handles cases where:
    // 1. Metadata is completely missing (both undefined)
    // 2. Metadata is stale (one or both flags missing but user should be onboarded)
    // 3. Session cookie hasn't refreshed after metadata update
    const needsDbFallback = 
        (onboarding2Completed === undefined && onboarding1Completed === undefined) ||
        (onboarding2Completed === undefined && onboarding1Completed === true) ||
        (onboarding1Completed === undefined && onboarding2Completed === true);
    
    if (needsDbFallback) {
        console.log("[Proxy] Clerk metadata unavailable or incomplete, falling back to database check");
        try {
            const userFromDb = await getUserByClerkId(userId);
            if (userFromDb) {
                // Use database values, but prefer Clerk metadata if it exists (for step 1)
                onboarding1Completed = onboarding1CompletedFromPublicMetadata ?? onboarding1CompletedFromMetadata ?? userFromDb.onboarding1Completed ?? false;
                onboarding2Completed = onboarding2CompletedFromPublicMetadata ?? onboarding2CompletedFromMetadata ?? userFromDb.onboarding2Completed ?? false;
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

