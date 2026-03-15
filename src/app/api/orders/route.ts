import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  successResponse,
  errorResponse,
  parseBody,
} from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { checkoutSchema } from "@/lib/validators/order";
import { getSessionUser } from "@/lib/auth-guards";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/order-emails";
import { sendEmail } from "@/lib/email";
import { adminNewOrderAlertHtml } from "@/lib/email-templates";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/orders — Create a new order
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Rate limit: 5 orders per minute per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`order:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  // Parse & validate
  const parsed = await parseBody(request, checkoutSchema);
  if ("error" in parsed) return parsed.error;
  const input = parsed.data;

  // Get optional user session
  const sessionUser = await getSessionUser(request);

  // Fetch business settings
  const settings = await prisma.businessSettings.findUnique({
    where: { id: "default" },
  });

  if (settings && !settings.isAcceptingOrders) {
    return errorResponse("We are not accepting orders right now. Please try again later.", 400);
  }

  // Re-validate all cart items server-side
  const menuItemIds = input.items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, isAvailable: true },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  const requestedByMenuItem = new Map<string, number>();
  for (const item of input.items) {
    requestedByMenuItem.set(
      item.menuItemId,
      (requestedByMenuItem.get(item.menuItemId) ?? 0) + item.quantity
    );
  }

  for (const item of input.items) {
    const dbItem = menuItemMap.get(item.menuItemId);
    if (!dbItem) {
      return errorResponse(
        `Item "${item.menuItemId}" is no longer available`,
        400
      );
    }
    // Check daily limit against requested quantity across all duplicate cart lines.
    if (dbItem.dailyLimit !== null) {
      const requestedQty = requestedByMenuItem.get(item.menuItemId) ?? 0;
      const remaining = Math.max(dbItem.dailyLimit - dbItem.soldToday, 0);
      if (requestedQty > remaining) {
        return errorResponse(
          `Only ${remaining} stock left for "${dbItem.name}" today`,
          400
        );
      }
    }

    if (dbItem.dailyLimit !== null && dbItem.soldToday >= dbItem.dailyLimit) {
      return errorResponse(
        `"${dbItem.name}" has sold out for today`,
        400
      );
    }
  }

  // Calculate totals server-side
  let subtotal = 0;
  const orderItems: {
    menuItemId: string;
    quantity: number;
    priceAtOrder: number;
    customizations: unknown;
    specialInstructions?: string;
  }[] = [];

  for (const item of input.items) {
    const dbItem = menuItemMap.get(item.menuItemId)!;
    let unitPrice = dbItem.price;

    // Handle size customization price
    if (
      item.customizations &&
      typeof item.customizations === "object" &&
      "sizePrice" in item.customizations
    ) {
      const sizePrice = (item.customizations as Record<string, unknown>).sizePrice;
      if (typeof sizePrice === "number" && sizePrice > 0) {
        unitPrice = sizePrice;
      }
    }

    // Handle add-ons
    if (
      item.customizations &&
      typeof item.customizations === "object" &&
      "addOns" in item.customizations
    ) {
      const addOns = (item.customizations as Record<string, unknown>).addOns;
      if (Array.isArray(addOns)) {
        for (const addOn of addOns) {
          if (typeof addOn === "object" && addOn !== null && "price" in addOn) {
            unitPrice += (addOn as { price: number }).price;
          }
        }
      }
    }

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      priceAtOrder: unitPrice,
      customizations: item.customizations ?? null,
      specialInstructions: item.specialInstructions,
    });
  }

  // Validate minimum order
  if (settings?.minimumOrder && subtotal < settings.minimumOrder) {
    return errorResponse(
      `Minimum order amount is ₱${settings.minimumOrder.toFixed(2)}`,
      400
    );
  }

  // Re-validate promo code
  let discount = 0;
  let promoCodeRecord = null;
  if (input.promoCode) {
    promoCodeRecord = await prisma.promoCode.findUnique({
      where: { code: input.promoCode.toUpperCase().trim() },
    });

    if (
      promoCodeRecord &&
      promoCodeRecord.isActive &&
      (!promoCodeRecord.expiryDate || new Date(promoCodeRecord.expiryDate) >= new Date()) &&
      (!promoCodeRecord.usageLimit || promoCodeRecord.usedCount < promoCodeRecord.usageLimit) &&
      (!promoCodeRecord.minOrderAmount || subtotal >= promoCodeRecord.minOrderAmount)
    ) {
      if (promoCodeRecord.discountType === "PERCENTAGE") {
        discount = subtotal * (promoCodeRecord.discountValue / 100);
        if (promoCodeRecord.maxDiscount) {
          discount = Math.min(discount, promoCodeRecord.maxDiscount);
        }
      } else {
        discount = promoCodeRecord.discountValue;
      }
      discount = Math.min(discount, subtotal);
      discount = Math.round(discount * 100) / 100;
    } else {
      promoCodeRecord = null; // invalid
    }
  }

  // Calculate delivery fee
  const deliveryFee =
    input.orderType === "DELIVERY"
      ? settings?.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold
        ? 0
        : settings?.deliveryFee ?? 0
      : 0;

  // Calculate tax
  const taxRate = settings?.taxRate ?? 0;
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;

  // Calculate total
  const tip = input.tip || 0;
  const total =
    Math.round((subtotal - discount + deliveryFee + tax + tip) * 100) / 100;

  // Generate unique order number
  const orderNumber = generateOrderNumber();

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: sessionUser?.id ?? null,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        orderType: input.orderType,
        status: "NEW",
        deliveryAddress: input.deliveryAddress ?? undefined,
        scheduledTime: input.scheduledTime
          ? new Date(input.scheduledTime)
          : null,
        subtotal,
        deliveryFee,
        tax,
        tip,
        discount,
        total,
        paymentMethod: input.paymentMethod,
        paymentStatus:
          input.paymentMethod === "CARD" ? "PENDING" : "PENDING",
        isGift: input.isGift,
        giftMessage: input.giftMessage ?? null,
        specialInstructions: input.specialInstructions ?? null,
        items: {
          create: orderItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
            customizations: item.customizations ?? undefined,
            specialInstructions: item.specialInstructions ?? null,
          })),
        },
      },
      include: {
        items: { include: { menuItem: true } },
      },
    });

    // Record initial status
    await tx.orderStatusHistory.create({
      data: {
        orderId: newOrder.id,
        status: "NEW",
        note: "Order placed",
      },
    });

    // Record promo redemption
    if (promoCodeRecord && discount > 0) {
      await tx.promoRedemption.create({
        data: {
          promoCodeId: promoCodeRecord.id,
          orderId: newOrder.id,
          userId: sessionUser?.id ?? null,
          discountApplied: discount,
        },
      });

      await tx.promoCode.update({
        where: { id: promoCodeRecord.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Update sold counts
    for (const item of orderItems) {
      await tx.menuItem.update({
        where: { id: item.menuItemId },
        data: { soldToday: { increment: item.quantity } },
      });
    }

    return newOrder;
  });

  // For card payments: create Stripe PaymentIntent
  if (input.paymentMethod === "CARD") {
    const amountInCentavos = Math.round(total * 100);

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

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return successResponse(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: order.paymentMethod,
        clientSecret: paymentIntent.client_secret,
      },
      201
    );
  }

  // For cash payments: confirm order immediately
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "CONFIRMED" },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "CONFIRMED",
      note: "Cash order confirmed",
    },
  });

  // Send confirmation email for cash orders
  try {
    await sendOrderConfirmationEmail({
      ...order,
      status: "CONFIRMED",
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }

  // Create admin notification + send admin alert email (fire and forget)
  prisma.notification.create({
    data: {
      type: "NEW_ORDER",
      title: `New Order ${order.orderNumber}`,
      message: `${order.customerName} placed a ${order.orderType.toLowerCase()} order for ${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(order.total)}`,
      data: { orderId: order.id, orderNumber: order.orderNumber },
    },
  }).catch(console.error);

  const bizSettings = await prisma.businessSettings.findUnique({ where: { id: "default" } });
  if (bizSettings?.email) {
    sendEmail({
      to: bizSettings.email,
      subject: `New Order ${order.orderNumber} | Native Delicacies`,
      html: adminNewOrderAlertHtml({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        itemCount: order.items.length,
        orderType: order.orderType,
      }),
    }).catch(console.error);
  }

  return successResponse(
    {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      paymentMethod: order.paymentMethod,
    },
    201
  );
});
