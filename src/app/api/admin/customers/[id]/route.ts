import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";

// GET /api/admin/customers/[id] — customer detail with order history
export const GET = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          orderType: true,
        },
      },
      _count: { select: { orders: true } },
    },
  });

  if (!user) return errorResponse("Customer not found", 404);

  // Calculate total spent
  const agg = await prisma.order.aggregate({
    where: { userId: id, status: { not: "CANCELLED" } },
    _sum: { total: true },
  });

  return successResponse({ ...user, totalSpent: agg._sum.total ?? 0 });
});
