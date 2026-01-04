import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/login",
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

    // Redirect to login if not authenticated
    if (!userId) {
        console.log("No userId, redirecting to /login.");
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check onboarding status from Clerk public metadata
    const onboardingCompleted = sessionClaims?.metadata?.onboardingCompleted as boolean | undefined;
    const isOnboardingPath = pathname.startsWith("/user/onboarding");

    // Redirect users who haven't finished onboarding
    if (!onboardingCompleted && !isOnboardingPath) {
        console.log("User not onboarded, redirecting to onboarding.");
        return NextResponse.redirect(new URL("/user/onboarding", request.url));
    }

    // Redirect completed users away from onboarding
    if (onboardingCompleted && isOnboardingPath) {
        console.log("User already onboarded, redirecting to home.");
        return NextResponse.redirect(new URL("/user", request.url));
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

