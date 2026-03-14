import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, parseBody } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";

// GET /api/admin/content — list all content pages
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const pages = await prisma.contentPage.findMany({
    orderBy: { slug: "asc" },
  });

  return successResponse(pages);
});

const contentPageSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

// POST /api/admin/content — create or update a content page (upsert by slug)
export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const result = await parseBody(request, contentPageSchema);
  if ("error" in result) return result.error;

  const { slug, title, content } = result.data;

  const page = await prisma.contentPage.upsert({
    where: { slug },
    create: { slug, title, content },
    update: { title, content },
  });

  return successResponse(page);
});
