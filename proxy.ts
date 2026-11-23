import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────
// Next.js 16 Route Protection — proxy.ts
// Network Edge Boundary Router
// Reference: cloths/proxy.ts
// ──────────────────────────────────────────────

// Routes that require authentication
const protectedRoutes = ["/saved"];

// Routes strictly for non-logged-in users
const authRoutes = ["/sign-in", "/sign-up"];

// Admin routes (require login and admin role check)
const adminRoutes = ["/admin"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Evaluate route types
  const isProtected = protectedRoutes.some((r) => path.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => path.startsWith(r));

  // Better-Auth session token cookie (stateless edge check)
  const sessionToken =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthenticated = Boolean(sessionToken);

  // 1. Protected routes → redirect to /sign-in if not authenticated
  if (isProtected && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signInUrl);
  }

  // 2. Admin routes → redirect to /sign-in if not authenticated
  if (isAdminRoute && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signInUrl);
  }

  // 3. Auth routes → redirect to home if already logged in
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Run proxy on all pages except static assets, media files, and API endpoints
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|webm)$).*)",
  ],
};
