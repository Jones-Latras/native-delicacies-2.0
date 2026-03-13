import { NextRequest } from "next/server";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validators";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-guards";
import { z } from "zod";

// GET /api/user/profile — get current user profile
export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if ("error" in result) return result.error;

  const user = await prisma.user.findUnique({
    where: { id: result.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      addresses: {
        orderBy: { isDefault: "desc" },
      },
    },
  });

  if (!user) return errorResponse("User not found", 404);

  return successResponse(user);
}

// PATCH /api/user/profile — update profile info
export async function PATCH(request: NextRequest) {
  const result = await requireAuth(request);
  if ("error" in result) return result.error;

  const parsed = await parseBody(request, profileUpdateSchema);
  if ("error" in parsed) return parsed.error;

  const user = await prisma.user.update({
    where: { id: result.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  return successResponse(user);
}
