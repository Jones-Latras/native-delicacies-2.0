import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";

// GET /api/admin/menu-items/[id]
export const GET = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      options: { orderBy: { displayOrder: "asc" } },
    },
  });

  if (!item) return errorResponse("Item not found", 404);
  return successResponse(item);
});

// PATCH /api/admin/menu-items/[id] — update item
export const PATCH = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) return errorResponse("Item not found", 404);

  const body = await request.json();

  // Only allow updating known fields
  const allowed = [
    "name", "description", "categoryId", "price", "imageUrl", "isAvailable", "isFeatured",
    "originRegion", "shelfLifeDays", "storageInstructions", "heritageStory",
    "dietaryTags", "preparationMinutes", "ingredients", "allergenInfo", "dailyLimit", "soldToday",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const updated = await prisma.menuItem.update({ where: { id }, data });
  return successResponse(updated);
});

// DELETE /api/admin/menu-items/[id]
export const DELETE = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) return errorResponse("Item not found", 404);

  await prisma.menuItem.delete({ where: { id } });
  return successResponse({ deleted: true });
});
