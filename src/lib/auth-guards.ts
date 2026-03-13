import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { UserRole } from "@/types";
import { errorResponse } from "./api-utils";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Extract the authenticated user from the JWT token.
 * Returns null if unauthenticated.
 */
export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const token = await getToken({ req: request });
  if (!token?.sub) return null;

  return {
    id: token.sub,
    email: token.email as string,
    name: token.name as string,
    role: (token.role as UserRole) ?? "CUSTOMER",
  };
}

/**
 * Require any authenticated user. Returns 401 if not logged in.
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const user = await getSessionUser(request);
  if (!user) {
    return { error: errorResponse("Authentication required", 401) };
  }
  return { user };
}

/**
 * Require a user with ADMIN role. Returns 401/403 accordingly.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const result = await requireAuth(request);
  if ("error" in result) return result;

  if (result.user.role !== "ADMIN") {
    return { error: errorResponse("Admin access required", 403) };
  }
  return result;
}

/**
 * Require a user with one of the specified roles.
 */
export async function requireRole(
  request: NextRequest,
  roles: UserRole[]
): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const result = await requireAuth(request);
  if ("error" in result) return result;

  if (!roles.includes(result.user.role)) {
    return { error: errorResponse("Insufficient permissions", 403) };
  }
  return result;
}
