import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { successResponse, parseBody } from "@/lib/api-utils";
import { sendEmail } from "@/lib/email";
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
      subject: "Reset Your Password — Native Delicacies",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #92400e;">Password Reset Request</h1>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;background:#92400e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }).catch(console.error);
  }

  return successResponse({ message: "If an account with that email exists, a reset link has been sent." });
}
