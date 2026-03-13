import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-guards";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// GET — list user's addresses
export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if ("error" in result) return result.error;

  const addresses = await prisma.address.findMany({
    where: { userId: result.user.id },
    orderBy: [{ isDefault: "desc" }, { label: "asc" }],
  });

  return successResponse(addresses);
}

// POST — add a new address
export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if ("error" in result) return result.error;

  const parsed = await parseBody(request, addressSchema);
  if ("error" in parsed) return parsed.error;

  // If this address is default, unset other defaults
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: result.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      ...parsed.data,
      userId: result.user.id,
    },
  });

  return successResponse(address, 201);
}
