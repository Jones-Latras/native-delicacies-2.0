import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-guards";
import { z } from "zod";

const addressUpdateSchema = z.object({
  label: z.string().min(1).optional(),
  street: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().optional(),
  postalCode: z.string().min(1).optional(),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

// PATCH — update address
export async function PATCH(request: NextRequest, context: RouteContext) {
  const result = await requireAuth(request);
  if ("error" in result) return result.error;

  const { id } = await context.params;

  // Verify ownership
  const existing = await prisma.address.findFirst({
    where: { id, userId: result.user.id },
  });
  if (!existing) return errorResponse("Address not found", 404);

  const parsed = await parseBody(request, addressUpdateSchema);
  if ("error" in parsed) return parsed.error;

  // If setting as default, unset others
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: result.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: parsed.data,
  });

  return successResponse(address);
}

// DELETE — remove address
export async function DELETE(request: NextRequest, context: RouteContext) {
  const result = await requireAuth(request);
  if ("error" in result) return result.error;

  const { id } = await context.params;

  const existing = await prisma.address.findFirst({
    where: { id, userId: result.user.id },
  });
  if (!existing) return errorResponse("Address not found", 404);

  await prisma.address.delete({ where: { id } });

  return successResponse({ message: "Address deleted." });
}
