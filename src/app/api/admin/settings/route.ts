import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, parseBody } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";
import { businessSettingsSchema } from "@/lib/validators/admin";

// GET /api/admin/settings
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  let settings = await prisma.businessSettings.findUnique({ where: { id: "default" } });

  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: { id: "default" },
    });
  }

  return successResponse(settings);
});

// PATCH /api/admin/settings
export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const result = await parseBody(request, businessSettingsSchema.partial());
  if ("error" in result) return result.error;

  const settings = await prisma.businessSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...result.data },
    update: result.data,
  });

  return successResponse(settings);
});
