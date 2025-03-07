import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
    // const token = await getToken({ req: request });
    // const pathname = request.nextUrl.pathname;
    // const searchParams = request.nextUrl.searchParams;

    // const publicRoutes = ["/login", "/"];

    // // Skip middleware for public pages
    // if (publicRoutes.some(route => pathname.startsWith(route))) {
    //     return NextResponse.next();
    // }

    // // Redirect if user is not authenticated
    // if (!token) {
    //     return NextResponse.redirect(new URL("/login", request.url));
    // }

    // console.log('Middleware pathname:', pathname, 'Middleware searchParams:', searchParams, 'Middleware requestUrl:', request.url);

    return NextResponse.next();
}

export const config = {
    matcher: "/:path*",
};
