import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookieString } from "./lib/auth";

// Define protected routes and the roles allowed to access them
const rolePrefixes = {
  "/admin": ["ADMIN"],
  "/instructor": ["ADMIN", "INSTRUCTOR"],
  "/student": ["ADMIN", "INSTRUCTOR", "STUDENT"],
};

// Define public routes that shouldn't require authentication (except the base dashboard routes if they match prefixes)
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/courses",
  "/categories",
  "/instructors",
  "/about",
  "/contact",
  "/faq",
  "/help",
  "/search",
  "/become-instructor",
  "/privacy",
  "/terms",
  "/cookies",
  "/blog",
  "/reviews",
  "/unauthorized",
  "/accept-invite",
  "/verify",
];

// Define API routes that have their own auth logic or are public
const publicApiRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/search",
  "/api/newsletter",
  "/api/support",
  "/api/courses",
  "/api/invites",
  "/api/categories",
  "/api/subcategories",
  "/api/reviews",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, Next.js internals, and public API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    publicApiRoutes.includes(pathname) ||
    publicApiRoutes.some((r) => pathname.startsWith(`${r}/`))
  ) {
    return NextResponse.next();
  }

  // 2. Check if route is public
  // Exact match for root, or starts with a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 3. Get session
  const cookieHeader = request.headers.get("cookie");
  const session = await getSessionFromCookieString(cookieHeader);

  // 4. Redirect authenticated users away from auth pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";
  
  if (isAuthPage && session) {
    // Redirect based on role
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (session.role === "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/instructor", request.url));
    } else {
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  // 5. Handle role-based protected routes
  for (const [prefix, allowedRoles] of Object.entries(rolePrefixes)) {
    if (pathname.startsWith(prefix)) {
      if (!session) {
        // Not logged in -> Redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (!allowedRoles.includes(session.role)) {
        // Logged in but wrong role -> Redirect to unauthorized
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // If user is suspended/inactive, they can't access protected routes
      if (!session.isActive) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Allow access
      return NextResponse.next();
    }
  }

  // 6. For any other route, if it's not public and they aren't logged in, redirect to login
  // Note: Learning routes like /courses/[id]/learn/... should be protected.
  // We'll protect them here if they aren't in the publicRoutes list.
  if (!isPublicRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply proxy to all routes except static files and images
    "/((?!_next/static|_next/image|images|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
