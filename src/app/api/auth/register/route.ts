import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { sendEmail } from "@/lib/email";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per minute per IP
  const ip = getClientIp(request);
  const limit = rateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!limit.success) return rateLimitResponse(limit.resetAt);

  const parsed = await parseBody(request, registerSchema);
  if ("error" in parsed) return parsed.error;

  const { name, email, phone, password } = parsed.data;

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse("An account with this email already exists", 409);
  }

  // Hash password and create user
  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Send welcome email (fire and forget)
  sendEmail({
    to: email,
    subject: "Welcome to Filipino Native Delicacies!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #92400e;">Welcome, ${name}! 🎉</h1>
        <p>Thank you for creating an account with Filipino Native Delicacies.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our collection of native Filipino treats</li>
          <li>Save your favorite items</li>
          <li>Track your orders in real-time</li>
          <li>Save delivery addresses for faster checkout</li>
        </ul>
        <p>Start exploring our menu and discover the rich flavors of Filipino heritage!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/menu" style="display:inline-block;background:#92400e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Browse Our Menu
        </a>
      </div>
    `,
  }).catch(console.error);

  return successResponse(user, 201);
}
