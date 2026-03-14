import { z } from "zod";

// ── Business Settings ──

const timeSlotSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
});

const dayScheduleSchema = z.object({
  isClosed: z.boolean(),
  slots: z.array(timeSlotSchema),
});

const operatingHoursSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
});

const deliveryZoneSchema = z.object({
  name: z.string().min(1),
  maxDistance: z.number().positive(),
  fee: z.number().min(0),
});

export const businessSettingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string().optional(),
    postalCode: z.string(),
  }),
  operatingHours: operatingHoursSchema,
  deliveryZones: z.array(deliveryZoneSchema),
  deliveryFee: z.number().min(0),
  minimumOrder: z.number().min(0),
  freeDeliveryThreshold: z.number().min(0).optional().nullable(),
  isAcceptingOrders: z.boolean(),
  taxRate: z.number().min(0).max(100),
  timezone: z.string().min(1),
  heroImageUrl: z.string().url().optional().nullable(),
  aboutText: z.string().optional().nullable(),
  announcementText: z.string().optional().nullable(),
  announcementActive: z.boolean().optional(),
  announcementBgColor: z.string().optional(),
});

// ── Promo Code ──

export const promoCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20)
    .transform((v) => v.toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minOrderAmount: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
  usageLimit: z.number().int().positive().optional().nullable(),
  applicableTo: z
    .object({
      categoryIds: z.array(z.string()).optional(),
      menuItemIds: z.array(z.string()).optional(),
    })
    .optional()
    .nullable(),
});

// ── Order Status Update (admin) ──

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "NEW",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED",
  ]),
  note: z.string().optional(),
  estimatedReadyTime: z.string().datetime().optional(),
});

// ── Admin User Management ──

export const adminCreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "ADMIN", "MANAGER", "STAFF"]),
  password: z.string().min(8),
});

export const adminUpdateUserRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN", "MANAGER", "STAFF"]),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;
export type PromoCodeInput = z.infer<typeof promoCodeSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserRoleInput = z.infer<typeof adminUpdateUserRoleSchema>;
