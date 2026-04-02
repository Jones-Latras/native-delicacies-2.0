import type { NextRequest } from "next/server";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export function getAppUrl(request?: NextRequest | Request) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (request) {
    const protocol =
      request.headers.get("x-forwarded-proto") ??
      (request.url.startsWith("https://") ? "https" : "http");
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");

    if (host) {
      return `${protocol}://${host}`;
    }

    try {
      return trimTrailingSlash(new URL(request.url).origin);
    } catch {
      // Fall through to localhost fallback below.
    }
  }

  return "http://localhost:3000";
}
