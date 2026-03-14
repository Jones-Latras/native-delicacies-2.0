import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireAdmin } from "@/lib/auth-guards";

// GET /api/admin/notifications — list recent notifications
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const notifications = await prisma.notification.findMany({
    where: unreadOnly ? { isRead: false } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { isRead: false },
  });

  return successResponse({ notifications, unreadCount });
});

// PATCH /api/admin/notifications — mark notifications as read
export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { ids, all } = body as { ids?: string[]; all?: boolean };

  if (all) {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  } else if (ids && ids.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true },
    });
  } else {
    return errorResponse("Provide 'ids' array or 'all: true'", 400);
  }

  return successResponse({ success: true });
});
