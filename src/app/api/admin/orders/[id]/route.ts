import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";
import { orderStatusUpdateSchema } from "@/lib/validators/admin";
import { sendOrderStatusEmail } from "@/lib/order-emails";
import { logActivity } from "@/lib/activity-log";

// GET /api/admin/orders/[id] — full order detail
export const GET = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
  if ("error" in auth) return auth.error;

  const { id } = (context as { params: Promise<{ id: string }> }).params
    ? await (context as { params: Promise<{ id: string }> }).params
    : { id: "" };

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { menuItem: { select: { name: true, imageUrl: true, slug: true } } },
      },
      statusHistory: { orderBy: { createdAt: "asc" } },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!order) return errorResponse("Order not found", 404);

  return successResponse(order);
});

// PATCH /api/admin/orders/[id] — update order status
export const PATCH = withErrorHandler(async (request: NextRequest, context: unknown) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
  if ("error" in auth) return auth.error;

  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const parsed = await parseBody(request, orderStatusUpdateSchema);
  if ("error" in parsed) return parsed.error;
  const { status, note, estimatedReadyTime } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        select: {
          quantity: true,
          priceAtOrder: true,
          menuItem: { select: { name: true } },
        },
      },
    },
  });
  if (!order) return errorResponse("Order not found", 404);

  // Valid transitions
  const transitions: Record<string, string[]> = {
    NEW: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["OUT_FOR_DELIVERY", "COMPLETED"],
    OUT_FOR_DELIVERY: ["COMPLETED"],
  };

  const allowed = transitions[order.status] || [];
  if (!allowed.includes(status)) {
    return errorResponse(
      `Cannot transition from ${order.status} to ${status}. Allowed: ${allowed.join(", ")}`,
      400
    );
  }

  const updateData: Record<string, unknown> = { status };
  const isCashOnDelivery = order.paymentMethod === "CASH_ON_DELIVERY";

  if (status === "COMPLETED" && isCashOnDelivery && order.paymentStatus === "PENDING") {
    updateData.paymentStatus = "PAID";
  }

  if (estimatedReadyTime) {
    updateData.estimatedReadyTime = new Date(estimatedReadyTime);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...updateData,
      statusHistory: {
        create: {
          status,
          changedBy: auth.user.id,
          note: note ?? null,
        },
      },
    },
  });

  // Send status email (fire and forget)
  sendOrderStatusEmail({
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    status,
    orderType: order.orderType,
    items: order.items.map((item) => ({
      name: item.menuItem.name,
      quantity: item.quantity,
      priceAtOrder: item.priceAtOrder,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    tax: order.tax,
    tip: order.tip,
    total: order.total,
  }).catch(() => {});

  logActivity("ORDER_STATUS_UPDATE", { orderId: id, from: order.status, to: status }, auth.user.id);

  return successResponse(updated);
});
