import { logger } from "@/lib/logger";

/**
 * Lightweight, dependency-free error reporting.
 *
 * When `SENTRY_DSN` is configured, exceptions are forwarded to Sentry's ingest
 * endpoint using the envelope API. When it is not set, `captureException` is a
 * no-op, so the app has zero error-tracking overhead in environments where it
 * isn't wanted. This can be swapped for the full `@sentry/nextjs` SDK later
 * without changing call sites.
 */

interface ParsedDsn {
  ingestUrl: string;
  publicKey: string;
}

function parseDsn(dsn: string): ParsedDsn | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace(/^\//, "");
    if (!publicKey || !projectId) return null;
    const ingestUrl = `${url.protocol}//${url.host}/api/${projectId}/envelope/`;
    return { ingestUrl, publicKey };
  } catch {
    return null;
  }
}

const dsn = process.env.SENTRY_DSN ? parseDsn(process.env.SENTRY_DSN) : null;

export function isErrorTrackingEnabled(): boolean {
  return dsn !== null;
}

export async function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  if (!dsn) return;

  try {
    const err = error instanceof Error ? error : new Error(String(error));
    const eventId = crypto.randomUUID().replace(/-/g, "");
    const sentAt = new Date().toISOString();

    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: "node",
      level: "error",
      environment: process.env.NODE_ENV ?? "development",
      release: process.env.VERCEL_GIT_COMMIT_SHA ?? undefined,
      exception: {
        values: [{ type: err.name, value: err.message }],
      },
      extra: context,
    };

    const envelope =
      JSON.stringify({ event_id: eventId, sent_at: sentAt }) +
      "\n" +
      JSON.stringify({ type: "event" }) +
      "\n" +
      JSON.stringify(event) +
      "\n";

    await fetch(dsn.ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_client=admire-boutique/1.0, sentry_key=${dsn.publicKey}`,
      },
      body: envelope,
    });
  } catch (sendErr) {
    // Never let error reporting break the request path.
    logger.warn("[SENTRY] Failed to report exception:", sendErr instanceof Error ? sendErr.message : sendErr);
  }
}
