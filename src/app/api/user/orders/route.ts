import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-guards";
import type { Prisma } from "@/generated/prisma/client";

// GET /api/user/orders — Authenticated user's order history
export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if ("error" in result) return result.error;

  try {
    const url = new URL(request.url);
    const { page, pageSize, skip } = getPaginationParams(url);
    const status = url.searchParams.get("status");

    const validStatuses = ["NEW", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"] as const;
    type OrderStatusValue = (typeof validStatuses)[number];

    const where: Prisma.OrderWhereInput = {
      userId: result.user.id,
    };
    if (status && validStatuses.includes(status as OrderStatusValue)) {
      where.status = status as OrderStatusValue;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          items: {
            include: {
              menuItem: {
                select: { name: true, imageUrl: true, slug: true },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const data = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      orderType: order.orderType,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        menuItemName: item.menuItem.name,
        menuItemImage: item.menuItem.imageUrl,
        menuItemSlug: item.menuItem.slug,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
      })),
    }));

    return paginatedResponse(data, total, page, pageSize);
  } catch (error) {
    console.error("[API Error] GET /api/user/orders:", error);
    return errorResponse("Internal server error", 500);
  }
}
