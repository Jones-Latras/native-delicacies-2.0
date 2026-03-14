import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, paginatedResponse, getPaginationParams } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";
import type { Prisma } from "@/generated/prisma/client";

const validStatuses = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof validStatuses)[number];

// GET /api/admin/orders — paginated, filterable orders list
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const { page, pageSize, skip } = getPaginationParams(url);

  const status = url.searchParams.get("status");
  const orderType = url.searchParams.get("orderType");
  const paymentMethod = url.searchParams.get("paymentMethod");
  const search = url.searchParams.get("search");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const sort = url.searchParams.get("sort") || "newest";

  const where: Prisma.OrderWhereInput = {};

  if (status && validStatuses.includes(status as OrderStatus)) {
    where.status = status as OrderStatus;
  }
  if (orderType === "DELIVERY" || orderType === "PICKUP") {
    where.orderType = orderType;
  }
  if (paymentMethod) {
    where.paymentMethod = paymentMethod as Prisma.OrderWhereInput["paymentMethod"];
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
    ];
  }
  if (dateFrom) {
    where.createdAt = { ...(where.createdAt as object), gte: new Date(dateFrom) };
  }
  if (dateTo) {
    const end = new Date(dateTo);
    end.setDate(end.getDate() + 1);
    where.createdAt = { ...(where.createdAt as object), lt: end };
  }

  const orderBy: Prisma.OrderOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" }
    : sort === "total_high" ? { total: "desc" }
    : sort === "total_low" ? { total: "asc" }
    : { createdAt: "desc" };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        orderType: true,
        status: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
        deliveryAddress: true,
        items: {
          select: { menuItem: { select: { name: true } }, quantity: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return paginatedResponse(orders, total, page, pageSize);
});
