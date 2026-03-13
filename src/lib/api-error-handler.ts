import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "./api-utils";

type RouteHandler = (request: NextRequest, context?: unknown) => Promise<NextResponse>;

/**
 * Wraps an API route handler with consistent error handling.
 * Catches unexpected errors and returns a 500 JSON response.
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(`[API Error] ${request.method} ${request.nextUrl.pathname}:`, error);
      return errorResponse("Internal server error", 500);
    }
  };
}
