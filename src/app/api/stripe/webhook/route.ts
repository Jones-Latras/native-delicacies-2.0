import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/order-emails";
import type Stripe from "stripe";

// Disable body parsing — Stripe needs raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(paymentIntent);
      break;
    }
    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) return;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
    },
    include: { items: { include: { menuItem: true } } },
  });

  // Record status change
  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "CONFIRMED",
      note: "Payment confirmed via Stripe",
    },
  });

  // Send confirmation email
  try {
    await sendOrderConfirmationEmail(order);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) return;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "FAILED",
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: "NEW",
      note: `Payment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
    },
  });
}
