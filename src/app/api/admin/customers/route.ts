import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paginatedResponse, getPaginationParams } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";
import type { Prisma } from "@/generated/prisma/client";

// GET /api/admin/customers
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN", "MANAGER", "STAFF"]);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const { page, pageSize, skip } = getPaginationParams(url);
  const search = url.searchParams.get("search") || "";
  const role = url.searchParams.get("role") || "";

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    const validRoles = ["CUSTOMER", "ADMIN", "MANAGER", "STAFF"] as const;
    if (validRoles.includes(role as typeof validRoles[number])) {
      where.role = role as typeof validRoles[number];
    }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedResponse(users, total, page, pageSize);
});
