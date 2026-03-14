import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paginatedResponse, getPaginationParams } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";

// GET /api/admin/activity-log
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const { page, pageSize, skip } = getPaginationParams(url);

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.activityLog.count(),
  ]);

  return paginatedResponse(logs, total, page, pageSize);
});
