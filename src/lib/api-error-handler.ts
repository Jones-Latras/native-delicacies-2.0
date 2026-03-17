import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "./api-utils";
import { captureError } from "./monitoring";

type RouteHandler<
  TContext = void,
  TResponse extends NextResponse = NextResponse,
> = (
  request: NextRequest,
  ...args: [TContext] extends [void] ? [] : [context: TContext]
) => Promise<TResponse>;

/**
 * Wraps an API route handler with consistent error handling.
 * Catches unexpected errors and returns a 500 JSON response.
 */
export function withErrorHandler<
  TContext = void,
  TResponse extends NextResponse = NextResponse,
>(
  handler: RouteHandler<TContext, TResponse>
): RouteHandler<TContext, TResponse> {
  return (async (request: NextRequest, ...args: [TContext] extends [void] ? [] : [context: TContext]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      captureError(error, {
        route: request.nextUrl.pathname,
        action: request.method,
      });
      return errorResponse("Internal server error", 500) as TResponse;
    }
  }) as RouteHandler<TContext, TResponse>;
}
