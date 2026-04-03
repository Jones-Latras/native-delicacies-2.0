import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types";
import { errorResponse } from "./api-utils";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Extract the authenticated user from the session.
 * Returns null if unauthenticated or if the backing user record no longer exists.
 */
export async function getSessionUser(_request: NextRequest): Promise<SessionUser | null> {
  void _request;
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
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
