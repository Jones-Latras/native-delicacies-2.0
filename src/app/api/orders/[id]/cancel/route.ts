import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-guards";
import { sendOrderStatusEmail } from "@/lib/order-emails";
import { createXenditRefund } from "@/lib/xendit";

const CANCELLATION_WINDOW_MINUTES = 15;

// POST /api/orders/[id]/cancel — Cancel an order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        status: true,
        customerName: true,
        customerEmail: true,
        orderType: true,
        paymentMethod: true,
        paymentStatus: true,
        stripePaymentIntentId: true,
        total: true,
        createdAt: true,
        estimatedReadyTime: true,
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Only the order owner or an admin can cancel
    if (order.userId !== auth.user.id && auth.user.role !== "ADMIN") {
      return errorResponse("Not authorized to cancel this order", 403);
    }

    // Only certain statuses can be cancelled
    const cancellableStatuses = ["NEW", "CONFIRMED"];
    if (!cancellableStatuses.includes(order.status)) {
      return errorResponse(
        `Cannot cancel an order that is ${order.status.replace(/_/g, " ").toLowerCase()}`,
        400
      );
    }

    // Check cancellation window (not for admins)
    if (auth.user.role !== "ADMIN") {
      const minutesSinceOrder =
        (Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60;
      if (minutesSinceOrder > CANCELLATION_WINDOW_MINUTES) {
        return errorResponse(
          `Orders can only be cancelled within ${CANCELLATION_WINDOW_MINUTES} minutes of placement. Please contact us for assistance.`,
          400
        );
      }
    }

    // Process Xendit refund if paid by GCash
    let refundId: string | undefined;
    let refundStatus: string | undefined;
    if (
      order.paymentMethod === "CARD" &&
      order.paymentStatus === "PAID" &&
      order.stripePaymentIntentId
    ) {
      try {
        const refund = await createXenditRefund({
          paymentRequestId: order.stripePaymentIntentId,
          referenceId: `${order.orderNumber}-cancel-${Date.now()}`,
          amount: order.total,
        });

        if (refund.status === "FAILED" || refund.status === "CANCELLED") {
          return errorResponse(
            "Failed to process GCash refund. Please contact support.",
            500
          );
        }

        refundId = refund.id;
        refundStatus = refund.status;
      } catch (refundError) {
        console.error("[Cancel] Xendit refund failed:", refundError);
        return errorResponse(
          "Failed to process GCash refund. Please contact support.",
          500
        );
      }
    }

    // Update order status and create history entry in a transaction
    const cancelled = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          paymentStatus:
            refundStatus === "SUCCEEDED"
              ? "REFUNDED"
              : order.paymentStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
          changedBy: auth.user.id,
          note: refundId
            ? `Cancelled by customer. GCash refund ${refundStatus?.toLowerCase() ?? "requested"}: ${refundId}`
            : "Cancelled by customer",
        },
      });

      return updated;
    });

    // Send cancellation email (fire and forget)
    sendOrderStatusEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderType: order.orderType,
      status: "CANCELLED",
      estimatedReadyTime: order.estimatedReadyTime,
    }).catch((err) => console.error("[Cancel] Email failed:", err));

    return successResponse({
      id: cancelled.id,
      orderNumber: cancelled.orderNumber,
      status: cancelled.status,
      paymentStatus: cancelled.paymentStatus,
      refundId,
    });
  } catch (error) {
    console.error("[API Error] POST /api/orders/[id]/cancel:", error);
    return errorResponse("Internal server error", 500);
  }
}
