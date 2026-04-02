import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const createPaymentIntentSchema = z.object({
  orderId: z.string().min(1),
});

// POST /api/stripe/create-payment-intent
export const POST = withErrorHandler(async (request: NextRequest) => {
  const ip = getClientIp(request);
  const rl = rateLimit(`payment:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  const parsed = createPaymentIntentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Invalid request", 422);
  }

  const { orderId } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return errorResponse("Order not found", 404);
  }

  if (order.paymentMethod !== "CARD") {
    return errorResponse("This order does not require GCash payment", 400);
  }

  if (order.paymentStatus === "PAID") {
    return errorResponse("This order has already been paid", 400);
  }

  // Calculate total server-side (never trust client)
  const amountInCentavos = Math.round(order.total * 100);

  if (amountInCentavos < 100) {
    return errorResponse("Order total is too small for GCash payment", 400);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCentavos,
    currency: "php",
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
    },
    receipt_email: order.customerEmail,
  });

  // Save payment intent id
  await prisma.order.update({
    where: { id: orderId },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  return successResponse({
    clientSecret: paymentIntent.client_secret,
  });
});
