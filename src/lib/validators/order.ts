import { z } from "zod";

export const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().positive(),
  customizations: z.record(z.string(), z.unknown()).optional(),
  specialInstructions: z.string().optional(),
});

export const checkoutSchema = z.object({
  orderType: z.enum(["DELIVERY", "PICKUP"]),
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  deliveryAddress: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().optional(),
      postalCode: z.string().min(1),
      deliveryInstructions: z.string().optional(),
    })
    .optional(),
  pickupTime: z.string().optional(),
  scheduledTime: z.string().optional(),
  isGift: z.boolean().default(false),
  giftMessage: z.string().optional(),
  specialInstructions: z.string().optional(),
  paymentMethod: z.enum(["CARD", "CASH_ON_DELIVERY", "CASH_AT_PICKUP"]),
  promoCode: z.string().optional(),
  tip: z.number().min(0).default(0),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
