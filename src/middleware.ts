import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("whisk_session");
  const { pathname } = request.nextUrl;

  let session: any = null;
  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (e) {}
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedCustomerRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/checkout");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  // 1. Admin route guard checks
  if (isAdminRoute) {
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    
    if (session.role !== "admin" && session.role !== "super-admin") {
      // Forbidden: redirect to home storefront
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 2. Protected customer storefront checks
  if (isProtectedCustomerRoute) {
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 3. Prevent logged-in users from seeing Auth forms
  if (isAuthRoute && session) {
    if (session.role === "admin" || session.role === "super-admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Map standard matching paths for faster execution
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/checkout/:path*", "/login", "/signup"],
};
