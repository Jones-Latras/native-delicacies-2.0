import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const resetWithTokenSchema = resetPasswordSchema.and(
  z.object({ token: z.string().min(1, "Reset token is required") })
);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`reset:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!limit.success) return rateLimitResponse(limit.resetAt);

  const parsed = await parseBody(request, resetWithTokenSchema);
  if ("error" in parsed) return parsed.error;

  const { token, password } = parsed.data;

  // Find valid token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    // Clean up expired token if it exists
    if (resetToken) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    }
    return errorResponse("Invalid or expired reset token", 400);
  }

  // Update password
  const passwordHash = await hash(password, 12);
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { passwordHash },
  });

  // Delete used token
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

  return successResponse({ message: "Password has been reset successfully." });
}
