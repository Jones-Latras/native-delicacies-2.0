import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { getAppUrl } from "@/lib/app-url";
import { markOrderPaidFromXendit, markOrderPaymentFailedFromXendit } from "@/lib/order-payment";
import {
  createGcashPaymentRequest,
  extractXenditRedirectUrl,
  getXenditPaymentRequestStatus,
  type XenditPaymentRequest,
  XenditApiError,
} from "@/lib/xendit";

export const GET = withErrorHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    if (order.paymentMethod !== "CARD") {
      return errorResponse("This order does not use online GCash payment", 400);
    }

    let paymentRequestId = order.stripePaymentIntentId;
    let paymentRequest: XenditPaymentRequest;

    try {
      if (!paymentRequestId) {
        const appUrl = getAppUrl(request);
        paymentRequest = await createGcashPaymentRequest({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          total: order.total,
          items: order.items.map((item) => ({
            id: item.id,
            name: item.menuItem.name,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
            imageUrl: item.menuItem.imageUrl,
          })),
          successReturnUrl: `${appUrl}/order/${order.id}/confirmation?paymentReturn=success`,
          failureReturnUrl: `${appUrl}/order/${order.id}/confirmation?paymentReturn=failure`,
        });

        paymentRequestId = paymentRequest.payment_request_id;

        await prisma.order.update({
          where: { id: order.id },
          data: {
            stripePaymentIntentId: paymentRequestId,
          },
        });
      } else {
        paymentRequest = await getXenditPaymentRequestStatus(paymentRequestId);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("XENDIT_SECRET_KEY is not set")
      ) {
        return errorResponse(
          "GCash payments are not configured yet. Add XENDIT_SECRET_KEY and try again.",
          503
        );
      }

      if (error instanceof XenditApiError) {
        return errorResponse(
          error.code ? `${error.message} (${error.code})` : error.message,
          error.status >= 400 && error.status < 500 ? error.status : 502
        );
      }

      throw error;
    }

    if (paymentRequest.status === "SUCCEEDED") {
      await markOrderPaidFromXendit(paymentRequest.payment_request_id);
    }

    if (
      paymentRequest.status === "FAILED" ||
      paymentRequest.status === "CANCELED" ||
      paymentRequest.status === "EXPIRED"
    ) {
      await markOrderPaymentFailedFromXendit(
        paymentRequest.payment_request_id,
        paymentRequest.failure_code ?? paymentRequest.status
      );
    }

    const refreshedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      select: {
        id: true,
        orderNumber: true,
        paymentMethod: true,
        paymentStatus: true,
        stripePaymentIntentId: true,
      },
    });

    if (!refreshedOrder) {
      return errorResponse("Order not found", 404);
    }

    return successResponse({
      id: refreshedOrder.id,
      orderNumber: refreshedOrder.orderNumber,
      paymentMethod: refreshedOrder.paymentMethod,
      paymentStatus: refreshedOrder.paymentStatus,
      paymentRequestId: refreshedOrder.stripePaymentIntentId,
      paymentRequestStatus: paymentRequest.status,
      checkoutUrl: extractXenditRedirectUrl(paymentRequest.actions),
      failureCode: paymentRequest.failure_code ?? null,
    });
  }
);
