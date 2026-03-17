import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-utils";
import { withErrorHandler } from "@/lib/api-error-handler";

const ALLOWED_SLUGS = new Set(["about", "contact"]);

// GET /api/content/[slug] - public content pages for storefront
export const GET = withErrorHandler(
  async (_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    if (!ALLOWED_SLUGS.has(slug)) {
      return successResponse(null);
    }

    const page = await prisma.contentPage.findUnique({
      where: { slug },
      select: { slug: true, title: true, content: true, updatedAt: true },
    });

    return successResponse(page);
  }
);
