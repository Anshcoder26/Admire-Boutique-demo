/**
 * Minimal structured logger with production-safe defaults.
 *
 * - `debug`/`info` are suppressed in production to avoid noisy/PII-leaking output.
 * - `warn`/`error` are always emitted.
 * - Object payloads are redacted so secrets, tokens, signatures, passwords, and
 *   similar sensitive fields never reach the logs.
 */

const isProduction = process.env.NODE_ENV === "production";

const SENSITIVE_KEY_PATTERN =
  /(password|passwd|secret|token|signature|authorization|cookie|api[-_]?key|otp|hash)/i;

export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth > 4) return "[Truncated]";

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }

  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : redact(val, depth + 1);
    }
    return out;
  }

  return value;
}

function format(args: unknown[]): unknown[] {
  return args.map((arg) =>
    typeof arg === "object" && arg !== null ? redact(arg) : arg,
  );
}

export const logger = {
  debug(...args: unknown[]): void {
    if (isProduction) return;
    console.debug(...format(args));
  },
  info(...args: unknown[]): void {
    if (isProduction) return;
    console.info(...format(args));
  },
  warn(...args: unknown[]): void {
    console.warn(...format(args));
  },
  error(...args: unknown[]): void {
    console.error(...format(args));
  },
};
