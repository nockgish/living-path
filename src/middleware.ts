import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight cookie-based gate. Full RBAC is enforced in server components
// via requireAdmin/requireUser. This middleware just deflects unauthenticated
// users to /sign-in early.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/account");

  if (isProtected && !sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
