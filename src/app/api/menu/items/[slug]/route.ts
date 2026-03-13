import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const item = await prisma.menuItem.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true, displayOrder: true, isVisible: true, imageUrl: true },
        },
        options: { orderBy: { displayOrder: "asc" } },
      },
    });

    if (!item) {
      return errorResponse("Item not found", 404);
    }

    return successResponse(item);
  } catch {
    return errorResponse("Failed to fetch item", 500);
  }
}
