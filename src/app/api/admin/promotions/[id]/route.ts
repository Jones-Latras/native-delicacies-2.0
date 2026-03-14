import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";

// PATCH /api/admin/promotions/[id]
export const PATCH = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const existing = await prisma.promoCode.findUnique({ where: { id } });
  if (!existing) return errorResponse("Promo code not found", 404);

  const body = await request.json();
  const allowed = [
    "code", "discountType", "discountValue", "minOrderAmount", "maxDiscount",
    "expiryDate", "isActive", "usageLimit", "applicableTo",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      data[key] = key === "expiryDate" && body[key] ? new Date(body[key]) : body[key];
    }
  }

  const updated = await prisma.promoCode.update({ where: { id }, data });
  return successResponse(updated);
});

// DELETE /api/admin/promotions/[id]
export const DELETE = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const existing = await prisma.promoCode.findUnique({
    where: { id },
    include: { _count: { select: { redemptions: true } } },
  });
  if (!existing) return errorResponse("Promo code not found", 404);

  if (existing._count.redemptions > 0) {
    // Don't delete, just deactivate
    await prisma.promoCode.update({ where: { id }, data: { isActive: false } });
    return successResponse({ deactivated: true });
  }

  await prisma.promoCode.delete({ where: { id } });
  return successResponse({ deleted: true });
});
