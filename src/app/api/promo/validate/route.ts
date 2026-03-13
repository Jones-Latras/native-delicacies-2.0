import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { z } from "zod";

const validatePromoSchema = z.object({
  code: z.string().min(1).max(50).transform((v) => v.toUpperCase().trim()),
  subtotal: z.number().min(0),
});

// POST /api/promo/validate — check code validity and return discount info
export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, validatePromoSchema);
  if ("error" in parsed) return parsed.error;

  const { code, subtotal } = parsed.data;

  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (!promo) {
    return errorResponse("Invalid promo code", 404);
  }

  if (!promo.isActive) {
    return errorResponse("This promo code is no longer active", 400);
  }

  if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
    return errorResponse("This promo code has expired", 400);
  }

  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return errorResponse("This promo code has reached its usage limit", 400);
  }

  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
    return errorResponse(
      `Minimum order of ₱${promo.minOrderAmount.toFixed(2)} required for this promo code`,
      400
    );
  }

  // Calculate discount
  let discount: number;
  if (promo.discountType === "PERCENTAGE") {
    discount = subtotal * (promo.discountValue / 100);
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  } else {
    discount = promo.discountValue;
  }

  discount = Math.min(discount, subtotal); // never more than subtotal

  return successResponse({
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discount: Math.round(discount * 100) / 100,
    message:
      promo.discountType === "PERCENTAGE"
        ? `${promo.discountValue}% off${promo.maxDiscount ? ` (up to ₱${promo.maxDiscount})` : ""}`
        : `₱${promo.discountValue} off`,
  });
}
