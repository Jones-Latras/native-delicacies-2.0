import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return successResponse(null);
    }

    return successResponse(settings);
  } catch {
    return errorResponse("Failed to fetch business settings", 500);
  }
}
