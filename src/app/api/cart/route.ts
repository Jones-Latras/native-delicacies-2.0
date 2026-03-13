import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth-guards";
import { successResponse, errorResponse } from "@/lib/api-utils";

// GET /api/cart — fetch saved cart for logged-in user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { savedCart: true },
  });

  return successResponse(user?.savedCart ?? { items: [], promoCode: null, promoDiscount: 0 });
}

// POST /api/cart — save/sync cart
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body", 400);
  }

  // Basic shape validation — the cart data is flexible JSON
  if (!body || typeof body !== "object") {
    return errorResponse("Invalid cart data", 400);
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { savedCart: body as object },
  });

  return successResponse({ saved: true });
}

// DELETE /api/cart — clear saved cart
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { savedCart: Prisma.DbNull },
  });

  return successResponse({ cleared: true });
}
