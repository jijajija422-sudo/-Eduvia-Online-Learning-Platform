import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookieString } from "./lib/auth";

// Role required per protected dashboard prefix
const rolePrefixes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/instructor": ["INSTRUCTOR", "ADMIN"],
  "/student": ["STUDENT", "INSTRUCTOR", "ADMIN"],
};

// Pages anyone may view without being logged in
const publicRoutes = [
  "/",
  "/login",
  "/admin/login",
  "/instructor/login",
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

// Authenticated users are bounced away from these (to their own dashboard)
const authPages = [
  "/login",
  "/admin/login",
  "/instructor/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Public API routes (auth handled inside the route)
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

function dashboardForRole(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "INSTRUCTOR") return "/instructor";
  return "/student";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static / Next internals / public APIs — never touch
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    publicApiRoutes.includes(pathname) ||
    publicApiRoutes.some((r) => pathname.startsWith(`${r}/`))
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromCookieString(request.headers.get("cookie"));
  const isAuthPage = authPages.some((p) => pathname === p);
  const isPublicRoute =
    publicRoutes.some((r) => pathname === r) ||
    publicRoutes.some((r) => pathname.startsWith(`${r}/`));

  // 2. If already signed in and hitting an auth page, send to the right dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL(dashboardForRole(session.role), request.url));
  }

  // 3. Auth pages (login/register/reset) are always reachable for guests
  if (isAuthPage) {
    return NextResponse.next();
  }

  // 4. Any other public route — reachable for guests
  if (isPublicRoute && !session) {
    return NextResponse.next();
  }

  // 5. If not logged in and not public — send to the correct login portal
  if (!session) {
    const loginPath =
      pathname.startsWith("/admin")
        ? "/admin/login"
        : pathname.startsWith("/instructor")
        ? "/instructor/login"
        : "/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Logged in — enforce role on protected prefixes
  for (const [prefix, allowedRoles] of Object.entries(rolePrefixes)) {
    if (pathname.startsWith(prefix)) {
      if (!allowedRoles.includes(session.role)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      if (!session.isActive) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      return NextResponse.next();
    }
  }

  // 7. Logged-in user on a non-protected, non-public route — allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
