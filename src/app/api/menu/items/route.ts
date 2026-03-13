import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getPaginationParams } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const { page, pageSize, skip } = getPaginationParams(url);

    const category = url.searchParams.get("category");
    const region = url.searchParams.get("region");
    const dietary = url.searchParams.get("dietary");
    const search = url.searchParams.get("search");
    const sort = url.searchParams.get("sort") ?? "popular";
    const available = url.searchParams.get("available");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { slug: category };
    }

    if (region) {
      where.originRegion = region;
    }

    if (dietary) {
      where.dietaryTags = { hasSome: dietary.split(",") };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (available !== "all") {
      where.isAvailable = true;
    }

    // Build orderBy
    let orderBy: Record<string, string> = {};
    switch (sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "popular":
      default:
        orderBy = { isFeatured: "desc" };
        break;
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          category: {
            select: { id: true, name: true, slug: true, displayOrder: true, isVisible: true, imageUrl: true },
          },
          options: { orderBy: { displayOrder: "asc" } },
        },
      }),
      prisma.menuItem.count({ where }),
    ]);

    return successResponse({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return errorResponse("Failed to fetch menu items", 500);
  }
}
