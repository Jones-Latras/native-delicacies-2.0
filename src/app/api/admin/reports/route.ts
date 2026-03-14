import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";

// GET /api/admin/reports?range=7d|30d|90d
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30d";
  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[range] || 30;

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Aggregate completed/non-cancelled orders in period
  const ordersInRange = await prisma.order.findMany({
    where: {
      createdAt: { gte: since },
      status: { not: "CANCELLED" },
    },
    select: {
      total: true,
      subtotal: true,
      deliveryFee: true,
      tax: true,
      tip: true,
      discount: true,
      orderType: true,
      paymentMethod: true,
      createdAt: true,
    },
  });

  const totalRevenue = ordersInRange.reduce((s, o) => s + o.total, 0);
  const totalOrders = ordersInRange.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalDeliveryFees = ordersInRange.reduce((s, o) => s + o.deliveryFee, 0);
  const totalTips = ordersInRange.reduce((s, o) => s + o.tip, 0);
  const totalDiscounts = ordersInRange.reduce((s, o) => s + o.discount, 0);

  // Order type breakdown
  const deliveryCount = ordersInRange.filter((o) => o.orderType === "DELIVERY").length;
  const pickupCount = ordersInRange.filter((o) => o.orderType === "PICKUP").length;

  // Payment method breakdown
  const paymentBreakdown = ordersInRange.reduce<Record<string, number>>((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1;
    return acc;
  }, {});

  // Daily revenue for chart
  const dailyRevenue: Record<string, number> = {};
  const dailyOrders: Record<string, number> = {};
  for (const o of ordersInRange) {
    const day = o.createdAt.toISOString().slice(0, 10);
    dailyRevenue[day] = (dailyRevenue[day] || 0) + o.total;
    dailyOrders[day] = (dailyOrders[day] || 0) + 1;
  }

  // Top 10 items by order count in range
  const topItems = await prisma.orderItem.groupBy({
    by: ["menuItemId"],
    where: {
      order: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
    },
    _sum: { quantity: true },
    _count: true,
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  });

  const menuItemIds = topItems.map((t) => t.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true, price: true },
  });
  const menuMap = new Map(menuItems.map((m) => [m.id, m]));

  const topItemsWithNames = topItems.map((t) => ({
    menuItemId: t.menuItemId,
    name: menuMap.get(t.menuItemId)?.name ?? "Unknown",
    price: menuMap.get(t.menuItemId)?.price ?? 0,
    totalQuantity: t._sum.quantity ?? 0,
    orderCount: t._count,
  }));

  // New customers in range
  const newCustomers = await prisma.user.count({
    where: { createdAt: { gte: since }, role: "CUSTOMER" },
  });

  // Cancelled orders
  const cancelledCount = await prisma.order.count({
    where: { createdAt: { gte: since }, status: "CANCELLED" },
  });

  return successResponse({
    range,
    days,
    totalRevenue,
    totalOrders,
    avgOrderValue,
    totalDeliveryFees,
    totalTips,
    totalDiscounts,
    deliveryCount,
    pickupCount,
    paymentBreakdown,
    dailyRevenue,
    dailyOrders,
    topItems: topItemsWithNames,
    newCustomers,
    cancelledCount,
  });
});
