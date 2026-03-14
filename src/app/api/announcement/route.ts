import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";

// Public endpoint — no auth required
export const GET = withErrorHandler(async () => {
  const settings = await prisma.businessSettings.findUnique({
    where: { id: "default" },
    select: {
      announcementText: true,
      announcementActive: true,
      announcementBgColor: true,
    },
  });

  if (!settings || !settings.announcementActive || !settings.announcementText) {
    return successResponse(null);
  }

  return successResponse({
    text: settings.announcementText,
    bgColor: settings.announcementBgColor,
  });
});
