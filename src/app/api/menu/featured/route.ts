import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isFeatured: true, isAvailable: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true, displayOrder: true, isVisible: true, imageUrl: true },
        },
        options: { orderBy: { displayOrder: "asc" } },
      },
    });

    return successResponse(items);
  } catch {
    return errorResponse("Failed to fetch featured items", 500);
  }
}
