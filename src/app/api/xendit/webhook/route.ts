import { NextRequest, NextResponse } from "next/server";
import {
  markOrderPaidFromXendit,
  markOrderPaymentFailedFromXendit,
  markOrderRefundFailedFromXendit,
  markOrderRefundSucceededFromXendit,
} from "@/lib/order-payment";
import { getXenditWebhookToken } from "@/lib/xendit";

export const dynamic = "force-dynamic";

type XenditWebhookPayload = {
  event?: string;
  data?: Record<string, unknown>;
};

function unwrapWebhookData(
  data: Record<string, unknown> | undefined
): Record<string, unknown> | null {
  if (!data) {
    return null;
  }

  if ("data" in data && data.data && typeof data.data === "object") {
    return data.data as Record<string, unknown>;
  }

  return data;
}

export async function POST(request: NextRequest) {
  const callbackToken = request.headers.get("x-callback-token");

  if (!callbackToken || callbackToken !== getXenditWebhookToken()) {
    return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
  }

  const payload = (await request.json()) as XenditWebhookPayload;
  const event = payload.event;
  const data = unwrapWebhookData(payload.data);

  if (!event || !data) {
    return NextResponse.json({ received: true });
  }

  if (event === "payment.capture") {
    const paymentRequestId =
      typeof data.payment_request_id === "string" ? data.payment_request_id : null;

    if (paymentRequestId) {
      await markOrderPaidFromXendit(paymentRequestId);
    }
  }

  if (event === "payment.failure") {
    const paymentRequestId =
      typeof data.payment_request_id === "string" ? data.payment_request_id : null;
    const failureReason =
      typeof data.failure_code === "string"
        ? data.failure_code
        : typeof data.status === "string"
          ? data.status
          : "Payment failed";

    if (paymentRequestId) {
      await markOrderPaymentFailedFromXendit(paymentRequestId, failureReason);
    }
  }

  if (event === "refund.succeeded") {
    const refundId = typeof data.id === "string" ? data.id : null;
    const paymentRequestId =
      typeof data.payment_request_id === "string" ? data.payment_request_id : null;

    if (refundId && paymentRequestId) {
      await markOrderRefundSucceededFromXendit(paymentRequestId, refundId);
    }
  }

  if (event === "refund.failed") {
    const refundId = typeof data.id === "string" ? data.id : null;
    const paymentRequestId =
      typeof data.payment_request_id === "string" ? data.payment_request_id : null;
    const failureCode =
      typeof data.failure_code === "string" ? data.failure_code : null;

    if (refundId && paymentRequestId) {
      await markOrderRefundFailedFromXendit(
        paymentRequestId,
        refundId,
        failureCode
      );
    }
  }

  return NextResponse.json({ received: true });
}
