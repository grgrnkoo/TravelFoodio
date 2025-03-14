import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  console.log('Token middleware: ', token)
  // ✅ Public routes that don't require authentication
  const publicRoutes = ["/login", "/feedback"];
  if (publicRoutes.includes(pathname) || pathname === "/") {
    console.log("Public route, allowing access.");
    return NextResponse.next();
  }

  // ✅ Redirect to login if no token
  if (!token) {
    console.log("No token, redirecting to /login.");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Extract username from pathname (e.g., /username/dashboard)
  const usernameMatch = pathname.match(/^\/([^\/]+)/);
  if (!usernameMatch) return NextResponse.next(); // No username in URL, just continue.

  const urlUsername = usernameMatch[1];

  // ✅ Ensure correct username in URL
  if (token.username !== urlUsername) {
    console.log("Incorrect URL, redirecting to correct username path.");
    return NextResponse.redirect(new URL(`/${token.username}`, request.url));
  }

  // ✅ Redirect users who haven't finished onboarding
  const isOnboardingPath = pathname.startsWith(`/${urlUsername}/onboarding`);

  if (!token.onboardingCompleted && !isOnboardingPath) {
    console.log("User not onboarded, redirecting to onboarding.");
    return NextResponse.redirect(new URL(`/${token.username}/onboarding`, request.url));
  }

  // ✅ Redirect completed users away from onboarding
  if (token.onboardingCompleted && isOnboardingPath) {
    console.log("User already onboarded, redirecting to home.");
    return NextResponse.redirect(new URL(`/${token.username}`, request.url));
  }

  return NextResponse.next();
}

// ✅ Ignore API, Next.js internals, and static files
export const config = {
  matcher: ["/((?!api|_next|api/auth/session|favicon.ico).*)"],
};
