import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        displayOrder: true,
        imageUrl: true,
        _count: { select: { menuItems: { where: { isAvailable: true } } } },
      },
    });

    const data = categories.map((c) => ({
      ...c,
      itemCount: c._count.menuItems,
      _count: undefined,
    }));

    return successResponse(data);
  } catch {
    return errorResponse("Failed to fetch categories", 500);
  }
}
