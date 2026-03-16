import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth-guards";
import { sendOrderStatusEmail } from "@/lib/order-emails";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED",
  ]),
  note: z.string().max(500).optional(),
});

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELLED"],
};

// PATCH /api/orders/[id]/status — Admin update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const parsed = await parseBody(request, updateStatusSchema);
    if ("error" in parsed) return parsed.error;

    const { status: newStatus, note } = parsed.data;

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

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Validate status transition
    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return errorResponse(
        `Cannot transition from ${order.status} to ${newStatus}`,
        400
      );
    }

    const isCashOnDelivery = order.paymentMethod === "CASH_ON_DELIVERY";
    const shouldMarkPaid =
      newStatus === "COMPLETED" &&
      isCashOnDelivery &&
      order.paymentStatus === "PENDING";

    // Update order status in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: order.id },
        data: {
          status: newStatus as never,
          ...(shouldMarkPaid ? { paymentStatus: "PAID" as never } : {}),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: newStatus as never,
          changedBy: auth.user.id,
          note: note ?? null,
        },
      });

      return result;
    });

    // Send status email notification (fire and forget)
    sendOrderStatusEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderType: order.orderType,
      status: newStatus,
      estimatedReadyTime: order.estimatedReadyTime,
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
    }).catch((err) => console.error("[StatusUpdate] Email failed:", err));

    return successResponse({
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
    });
  } catch (error) {
    console.error("[API Error] PATCH /api/orders/[id]/status:", error);
    return errorResponse("Internal server error", 500);
  }
}
