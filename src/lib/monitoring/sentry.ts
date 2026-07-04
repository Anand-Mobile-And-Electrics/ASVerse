import * as Sentry from "@sentry/nextjs";

let initialized = false;

export function initSentry() {
  if (initialized) return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({ dsn, tracesSampleRate: 0.1 });
  initialized = true;
}

export function captureError(error: unknown) {
  initSentry();
  if (error instanceof Error) {
    Sentry.captureException(error);
  } else {
    Sentry.captureMessage("Non-Error exception captured");
  }
}
