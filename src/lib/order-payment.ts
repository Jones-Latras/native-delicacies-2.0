import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { adminNewOrderAlertHtml } from "@/lib/email-templates";
import { sendOrderConfirmationEmail } from "@/lib/order-emails";

async function notifyAdminOfPaidOrder(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  orderType: string;
  items: unknown[];
}) {
  prisma.notification
    .create({
      data: {
        type: "NEW_ORDER",
        title: `New Order ${order.orderNumber}`,
        message: `${order.customerName} placed a ${order.orderType.toLowerCase()} order for ${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(order.total)}`,
        data: { orderId: order.id, orderNumber: order.orderNumber },
      },
    })
    .catch(console.error);

  const settings = await prisma.businessSettings.findUnique({
    where: { id: "default" },
  });

  if (settings?.email) {
    sendEmail({
      to: settings.email,
      subject: `New Order ${order.orderNumber} | J&J Native Delicacies`,
      html: adminNewOrderAlertHtml({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        itemCount: order.items.length,
        orderType: order.orderType,
      }),
    }).catch(console.error);
  }
}

export async function markOrderPaidFromXendit(
  paymentRequestId: string,
  note = "Payment confirmed via Xendit"
) {
  const result = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findFirst({
      where: { stripePaymentIntentId: paymentRequestId },
      include: { items: { include: { menuItem: true } } },
    });

    if (!existingOrder) {
      return { order: null, changed: false };
    }

    if (
      existingOrder.paymentStatus === "PAID" ||
      existingOrder.paymentStatus === "REFUNDED"
    ) {
      return { order: existingOrder, changed: false };
    }

    const updatedOrder = await tx.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentStatus: "PAID",
        status: existingOrder.status === "NEW" ? "CONFIRMED" : existingOrder.status,
      },
      include: { items: { include: { menuItem: true } } },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        note,
      },
    });

    return { order: updatedOrder, changed: true };
  });

  if (result.changed && result.order && result.order.status !== "CANCELLED") {
    sendOrderConfirmationEmail(result.order).catch(console.error);
    notifyAdminOfPaidOrder(result.order).catch(console.error);
  }

  return result.order;
}

export async function markOrderPaymentFailedFromXendit(
  paymentRequestId: string,
  failureReason: string
) {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findFirst({
      where: { stripePaymentIntentId: paymentRequestId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
      },
    });

    if (
      !existingOrder ||
      existingOrder.paymentStatus === "PAID" ||
      existingOrder.paymentStatus === "FAILED" ||
      existingOrder.paymentStatus === "REFUNDED"
    ) {
      return existingOrder;
    }

    const updatedOrder = await tx.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentStatus: "FAILED",
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: updatedOrder.id,
        status: existingOrder.status,
        note: `GCash payment failed via Xendit: ${failureReason}`,
      },
    });

    return updatedOrder;
  });
}

export async function markOrderRefundSucceededFromXendit(
  paymentRequestId: string,
  refundId: string
) {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findFirst({
      where: { stripePaymentIntentId: paymentRequestId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
      },
    });

    if (!existingOrder || existingOrder.paymentStatus === "REFUNDED") {
      return existingOrder;
    }

    const updatedOrder = await tx.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentStatus: "REFUNDED",
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: updatedOrder.id,
        status: existingOrder.status,
        note: `GCash refund completed via Xendit: ${refundId}`,
      },
    });

    return updatedOrder;
  });
}

export async function markOrderRefundFailedFromXendit(
  paymentRequestId: string,
  refundId: string,
  failureCode?: string | null
) {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findFirst({
      where: { stripePaymentIntentId: paymentRequestId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingOrder) {
      return null;
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: existingOrder.id,
        status: existingOrder.status,
        note: `GCash refund failed via Xendit (${refundId})${failureCode ? `: ${failureCode}` : ""}`,
      },
    });

    return existingOrder;
  });
}
