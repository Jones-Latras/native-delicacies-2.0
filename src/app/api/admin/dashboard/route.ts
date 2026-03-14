import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";

// GET /api/admin/dashboard — Dashboard stats
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
  if ("error" in auth) return auth.error;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // Today's orders
  const todayOrders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfToday } },
    select: { total: true, status: true, paymentStatus: true },
  });

  // Yesterday's orders (for comparison)
  const yesterdayOrders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfYesterday, lt: startOfToday } },
    select: { total: true },
  });

  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus === "PAID" || o.paymentStatus === "PENDING")
    .reduce((sum, o) => sum + o.total, 0);
  const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.total, 0);
  const revenueChange = yesterdayRevenue > 0
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
    : todayRevenue > 0 ? 100 : 0;

  const todayOrderCount = todayOrders.length;
  const yesterdayOrderCount = yesterdayOrders.length;
  const orderChange = yesterdayOrderCount > 0
    ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100
    : todayOrderCount > 0 ? 100 : 0;

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  for (const o of todayOrders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }

  // Most popular item today
  const popularItems = await prisma.orderItem.groupBy({
    by: ["menuItemId"],
    where: { order: { createdAt: { gte: startOfToday } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 1,
  });

  let mostPopular = "No orders yet";
  if (popularItems.length > 0) {
    const item = await prisma.menuItem.findUnique({
      where: { id: popularItems[0].menuItemId },
      select: { name: true },
    });
    if (item) mostPopular = item.name;
  }

  // Recent orders (last 10)
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      orderType: true,
      status: true,
      total: true,
      paymentStatus: true,
      createdAt: true,
      deliveryAddress: true,
      items: {
        select: { menuItem: { select: { name: true } }, quantity: true },
      },
    },
  });

  // Product availability quick look
  const products = await prisma.menuItem.findMany({
    orderBy: { name: "asc" },
    take: 10,
    select: {
      id: true,
      name: true,
      isAvailable: true,
      isFeatured: true,
      dailyLimit: true,
      soldToday: true,
    },
  });

  return successResponse({
    todayRevenue,
    revenueChange: Math.round(revenueChange * 10) / 10,
    todayOrderCount,
    orderChange: Math.round(orderChange * 10) / 10,
    mostPopular,
    statusCounts,
    recentOrders,
    products,
  });
});
