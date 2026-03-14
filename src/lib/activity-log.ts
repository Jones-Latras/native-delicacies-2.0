import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function logActivity(
  action: string,
  details?: Record<string, unknown>,
  userId?: string,
  ipAddress?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        details: (details as Prisma.InputJsonValue) ?? undefined,
        userId: userId ?? null,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch {
    // Activity logging should never break the request
    console.error("Failed to log activity:", action);
  }
}
