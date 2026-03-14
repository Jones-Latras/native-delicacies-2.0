import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paginatedResponse, getPaginationParams, parseBody } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";
import { promoCodeSchema } from "@/lib/validators/admin";

// GET /api/admin/promotions
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const { page, pageSize, skip } = getPaginationParams(url);
  const search = url.searchParams.get("search") || "";
  const active = url.searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (search) {
    where.code = { contains: search, mode: "insensitive" };
  }
  if (active === "true") where.isActive = true;
  if (active === "false") where.isActive = false;

  const [promos, total] = await Promise.all([
    prisma.promoCode.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { redemptions: true } } },
    }),
    prisma.promoCode.count({ where }),
  ]);

  return paginatedResponse(promos, total, page, pageSize);
});

// POST /api/admin/promotions — create promo
export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const result = await parseBody(request, promoCodeSchema);
  if ("error" in result) return result.error;

  const { data } = result;

  const promo = await prisma.promoCode.create({
    data: {
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount,
      maxDiscount: data.maxDiscount,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      isActive: data.isActive,
      usageLimit: data.usageLimit,
      applicableTo: data.applicableTo ?? undefined,
    },
  });

  return paginatedResponse([promo], 1, 1, 1);
});
