import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paginatedResponse, getPaginationParams, parseBody } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";
import { requireRole } from "@/lib/auth-guards";
import { adminCreateUserSchema } from "@/lib/validators/admin";
import bcrypt from "bcryptjs";

// GET /api/admin/users — list staff (non-CUSTOMER) users
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const { page, pageSize, skip } = getPaginationParams(url);
  const search = url.searchParams.get("search") || "";

  const where: Record<string, unknown> = {
    role: { in: ["ADMIN", "MANAGER", "STAFF"] },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
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
      },
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedResponse(users, total, page, pageSize);
});

// POST /api/admin/users — create a staff user
export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireRole(request, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const result = await parseBody(request, adminCreateUserSchema);
  if ("error" in result) return result.error;

  const { email, name, phone, role, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return paginatedResponse([], 0, 1, 1); // error handled via empty
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, name, phone, role, passwordHash, emailVerified: true },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return paginatedResponse([user], 1, 1, 1);
});
