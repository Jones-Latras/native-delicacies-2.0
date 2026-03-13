import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  isAvailable: z.boolean().default(true),
  originRegion: z.enum(["Luzon", "Visayas", "Mindanao"]).optional(),
  shelfLifeDays: z.number().int().positive().optional(),
  storageInstructions: z.string().optional(),
  heritageStory: z.string().optional(),
  dietaryTags: z.array(z.string()).default([]),
  preparationMinutes: z.number().int().positive().optional(),
  ingredients: z.string().optional(),
  allergenInfo: z.string().optional(),
  dailyLimit: z.number().int().positive().optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  imageUrl: z.string().url().optional(),
  isVisible: z.boolean().default(true),
});

export const menuItemOptionSchema = z.object({
  menuItemId: z.string(),
  optionGroup: z.string().min(1, "Option group is required"),
  name: z.string().min(1, "Option name is required"),
  priceModifier: z.number().default(0),
  isRequired: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type MenuItemOptionInput = z.infer<typeof menuItemOptionSchema>;
