import { NextRequest } from "next/server";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-guards";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if ("error" in result) return result.error;

  const parsed = await parseBody(request, changePasswordSchema);
  if ("error" in parsed) return parsed.error;

  const user = await prisma.user.findUnique({
    where: { id: result.user.id },
    select: { passwordHash: true },
  });

  if (!user) return errorResponse("User not found", 404);

  const valid = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return errorResponse("Current password is incorrect", 400);

  const passwordHash = await hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: result.user.id },
    data: { passwordHash },
  });

  return successResponse({ message: "Password updated successfully." });
}
