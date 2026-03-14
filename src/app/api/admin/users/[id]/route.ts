import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";
import { adminUpdateUserRoleSchema } from "@/lib/validators/admin";

// PATCH /api/admin/users/[id] — update role
export const PATCH = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return errorResponse("User not found", 404);

  // Don't allow changing own role
  if (existing.id === auth.user.id) {
    return errorResponse("Cannot change your own role", 400);
  }

  const result = await parseBody(request, adminUpdateUserRoleSchema);
  if ("error" in result) return result.error;

  const updated = await prisma.user.update({
    where: { id },
    data: { role: result.data.role },
    select: { id: true, name: true, email: true, role: true },
  });

  return successResponse(updated);
});

// DELETE /api/admin/users/[id] — remove user
export const DELETE = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  if (id === auth.user.id) {
    return errorResponse("Cannot delete your own account", 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return errorResponse("User not found", 404);

  await prisma.user.delete({ where: { id } });
  return successResponse({ deleted: true });
});
