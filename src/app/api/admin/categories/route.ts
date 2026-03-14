import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, parseBody } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";
import { categorySchema } from "@/lib/validators/menu";

// GET /api/admin/categories — list all categories
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
  if ("error" in auth) return auth.error;

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { menuItems: true } },
    },
  });

  return successResponse(categories);
});

// POST /api/admin/categories — create a category
export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const result = await parseBody(request, categorySchema);
  if ("error" in result) return result.error;

  const slug = result.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const maxOrder = await prisma.category.aggregate({ _max: { displayOrder: true } });
  const displayOrder = (maxOrder._max.displayOrder ?? 0) + 1;

  const category = await prisma.category.create({
    data: {
      ...result.data,
      slug,
      displayOrder,
    },
  });

  return successResponse(category, 201);
});
