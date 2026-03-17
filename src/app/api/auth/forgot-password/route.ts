import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { successResponse, parseBody } from "@/lib/api-utils";
import { sendEmail } from "@/lib/email";
import { passwordResetEmailHtml } from "@/lib/email-templates";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 3 requests per minute per IP
  const ip = getClientIp(request);
  const limit = rateLimit(`forgot:${ip}`, { maxRequests: 3, windowMs: 60_000 });
  if (!limit.success) return rateLimitResponse(limit.resetAt);

  const parsed = await parseBody(request, forgotPasswordSchema);
  if ("error" in parsed) return parsed.error;

  const { email } = parsed.data;

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Generate token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    sendEmail({
      to: email,
      subject: "Reset Your Password — J&J Native Delicacies",
      html: passwordResetEmailHtml(user.name, resetUrl),
    }).catch(console.error);
  }

  return successResponse({ message: "If an account with that email exists, a reset link has been sent." });
}

