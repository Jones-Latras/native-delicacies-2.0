import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const ADMIN_ROLES = ["ADMIN", "MANAGER", "STAFF"];

const protectedRoutes = ["/profile", "/checkout"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const token = req.auth;

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((r) => pathname.startsWith(r)) && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect user routes — require any authenticated user
  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes — require admin roles
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    // Allow access to admin login page
    if (pathname === "/admin/login") return NextResponse.next();

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const role = (token.user as { role?: string } | undefined)?.role;
    if (!role || !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
