import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";

// PATCH /api/admin/categories/[id]
export const PATCH = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return errorResponse("Category not found", 404);

  const body = await request.json();
  const allowed = ["name", "description", "isVisible", "displayOrder", "imageUrl"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (data.name && typeof data.name === "string") {
    data.slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const updated = await prisma.category.update({ where: { id }, data });
  return successResponse(updated);
});

// DELETE /api/admin/categories/[id]
export const DELETE = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { menuItems: true } } },
  });

  if (!existing) return errorResponse("Category not found", 404);
  if (existing._count.menuItems > 0) {
    return errorResponse("Cannot delete category with existing menu items. Reassign or remove items first.", 400);
  }

  await prisma.category.delete({ where: { id } });
  return successResponse({ deleted: true });
});
