/**
 * Application monitoring and error tracking.
 * In production, replace console calls with Sentry or a similar service.
 *
 * Setup Sentry:
 *   npm install @sentry/nextjs
 *   npx @sentry/wizard@latest -i nextjs
 *   Then update the functions below to use Sentry.captureException / Sentry.captureMessage
 */

type ErrorSeverity = "fatal" | "error" | "warning" | "info";

interface ErrorContext {
  userId?: string;
  route?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

export function captureError(
  error: unknown,
  context?: ErrorContext,
  severity: ErrorSeverity = "error"
) {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  // In production, send to Sentry:
  // Sentry.captureException(errorObj, { level: severity, extra: context });

  const prefix = `[${severity.toUpperCase()}]`;
  const ctx = context
    ? ` | ${[context.route, context.action, context.userId].filter(Boolean).join(" > ")}`
    : "";

  console.error(`${prefix}${ctx}`, errorObj.message);

  if (context?.extra) {
    console.error("  Context:", JSON.stringify(context.extra));
  }
}

export function captureMessage(
  message: string,
  context?: ErrorContext,
  severity: ErrorSeverity = "info"
) {
  // In production: Sentry.captureMessage(message, { level: severity, extra: context });
  const prefix = `[${severity.toUpperCase()}]`;
  console.log(`${prefix} ${message}`, context?.extra ?? "");
}

/** Track key business events for analytics */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  // In production: analytics.track(event, properties) or Vercel Analytics
  if (process.env.NODE_ENV === "development") {
    console.log(`[EVENT] ${event}`, properties ?? "");
  }
}

/** Performance timing helper */
export function measurePerformance(label: string) {
  const start = performance.now();
  return {
    end() {
      const duration = performance.now() - start;
      if (duration > 500) {
        captureMessage(`Slow operation: ${label} took ${duration.toFixed(0)}ms`, {
          extra: { duration, label },
        }, "warning");
      }
      return duration;
    },
  };
}
