import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

// GET /api/orders/[id] — Fetch order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: {
              select: { name: true, imageUrl: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    return successResponse({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      orderType: order.orderType,
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      scheduledTime: order.scheduledTime,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      tax: order.tax,
      tip: order.tip,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      isGift: order.isGift,
      giftMessage: order.giftMessage,
      specialInstructions: order.specialInstructions,
      estimatedReadyTime: order.estimatedReadyTime,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        menuItemName: item.menuItem.name,
        menuItemImage: item.menuItem.imageUrl,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
        customizations: item.customizations,
        specialInstructions: item.specialInstructions,
      })),
      statusHistory: order.statusHistory,
    });
  } catch (error) {
    console.error("[API Error] GET /api/orders/[id]:", error);
    return errorResponse("Internal server error", 500);
  }
}
