import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "./api-utils";
import { captureError } from "./monitoring";

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
      captureError(error, {
        route: request.nextUrl.pathname,
        action: request.method,
      });
      return errorResponse("Internal server error", 500);
    }
  };
}
