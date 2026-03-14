import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
  parseBody,
} from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";
import { menuItemSchema } from "@/lib/validators/menu";
import { slugify } from "@/lib/utils";

// GET /api/admin/menu-items — paginated, filterable
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const { page, pageSize, skip } = getPaginationParams(url);
  const search = url.searchParams.get("search");
  const categoryId = url.searchParams.get("categoryId");
  const available = url.searchParams.get("available");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (available === "true") where.isAvailable = true;
  if (available === "false") where.isAvailable = false;

  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
      include: { category: { select: { name: true } } },
    }),
    prisma.menuItem.count({ where }),
  ]);

  return paginatedResponse(items, total, page, pageSize);
});

// POST /api/admin/menu-items — create new item
export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER"]);
  if ("error" in auth) return auth.error;

  const parsed = await parseBody(request, menuItemSchema);
  if ("error" in parsed) return parsed.error;
  const input = parsed.data;

  // Generate unique slug
  let slug = slugify(input.name);
  const existing = await prisma.menuItem.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const item = await prisma.menuItem.create({
    data: { ...input, slug },
  });

  return successResponse(item, 201);
});
