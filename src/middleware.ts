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

  // 1. Alias /admin -> /owner
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL("/owner", request.url));
  }

  // 2. Alias /dashboard -> /user
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  // 3. Alias /login -> /user
  if (pathname === "/login") {
    if (session) {
      if (session.role === "admin" || session.role === "super-admin") {
        return NextResponse.redirect(new URL("/owner", request.url));
      }
      return NextResponse.redirect(new URL("/user", request.url));
    }
    return NextResponse.redirect(new URL("/user", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login"],
};
