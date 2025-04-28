// This middleware would handle authentication and role-based access control
// It would:
// 1. Check if the user is authenticated
// 2. Verify if the user has access to the requested route based on their role
// 3. Redirect to appropriate pages if needed

import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { UserRole } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If token is missing or user has no role (shouldn't happen), redirect to login
    if (!token?.role) {
      console.log("No token or role found, redirecting to login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as UserRole;

    // Admin routes are only accessible by ADMIN users
    if (path.startsWith("/admin") && role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Teacher routes are only accessible by TEACHER users
    if (path.startsWith("/teacher") && role !== UserRole.TEACHER) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Student routes are only accessible by STUDENT users
    if (path.startsWith("/student") && role !== UserRole.STUDENT) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Specify which routes should be protected by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/(.*)          (auth endpoints)
     * - /login                  (login page)
     * - /                       (homepage)
     * - /unauthorized           (unauthorized page)
     * - /_next/static/(.*)      (static files)
     * - /_next/image/(.*)       (image optimization files)
     * - /favicon.ico            (favicon)
     * - /images/(.*)            (image assets)
     */
    "/((?!api/auth|login|unauthorized|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
