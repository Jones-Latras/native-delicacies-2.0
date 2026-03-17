import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";
import { sendEmail } from "@/lib/email";
import { welcomeEmailHtml } from "@/lib/email-templates";
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
    subject: "Welcome to J&J Native Delicacies! 🎉",
    html: welcomeEmailHtml(name),
  }).catch(console.error);

  return successResponse(user, 201);
}

