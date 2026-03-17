const isEnabled = () => {
  if (typeof window !== "undefined") {
    return !!process.env.NEXT_PUBLIC_SENTRY_DSN;
  }
  return !!process.env.SENTRY_DSN;
};

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (!isEnabled()) return;

  // When Sentry is installed, replace with:
  // Sentry.captureException(error, { extra: context });
  if (typeof window !== "undefined") {
    // biome-ignore lint/suspicious/noConsole: stub fallback before Sentry SDK is installed
    console.error("[error-tracking]", error, context);
  }
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
) {
  if (!isEnabled()) return;

  // When Sentry is installed, replace with:
  // Sentry.captureMessage(message, level);
  if (typeof window !== "undefined") {
    // biome-ignore lint/suspicious/noConsole: stub fallback before Sentry SDK is installed
    console.warn(`[error-tracking:${level}]`, message);
  }
}
