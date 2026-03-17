import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, parseBody } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { sendEmail } from "@/lib/email";
import { contactFormConfirmationHtml, adminContactFormHtml } from "@/lib/email-templates";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, { maxRequests: 3, windowMs: 60_000 });
  if (!limit.success) return rateLimitResponse(limit.resetAt);

  const result = await parseBody(request, contactSchema);
  if ("error" in result) return result.error;

  const { name, email, phone, subject, message } = result.data;

  // Create notification for admin
  await prisma.notification.create({
    data: {
      type: "CONTACT_MESSAGE",
      title: `New message: ${subject}`,
      message: `${name} (${email}) sent a contact form message`,
      data: { name, email, phone, subject },
    },
  });

  // Send confirmation to the customer
  sendEmail({
    to: email,
    subject: "We received your message — J&J Native Delicacies",
    html: contactFormConfirmationHtml(name),
  }).catch(console.error);

  // Forward to business email
  const settings = await prisma.businessSettings.findUnique({ where: { id: "default" } });
  if (settings?.email) {
    sendEmail({
      to: settings.email,
      subject: `Contact Form: ${subject} — J&J Native Delicacies`,
      html: adminContactFormHtml({ name, email, phone, subject, message }),
    }).catch(console.error);
  }

  return successResponse({ success: true });
});

