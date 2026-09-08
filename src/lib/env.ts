import { logger } from "@/lib/logger";

/**
 * Centralised environment-variable validation and typed access.
 *
 * `validateEnv()` is run once at server startup (see `src/instrumentation.ts`).
 * It fails fast for variables that are critical in production, and warns for
 * recommended-but-optional configuration so misconfigurations surface early
 * instead of causing confusing runtime failures.
 */

const isProduction = process.env.NODE_ENV === "production";

export interface EnvValidationResult {
  errors: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical in production: without a database the app cannot persist
  // sessions, orders, or rate-limit state across serverless invocations.
  if (isProduction && !process.env.DATABASE_URL) {
    errors.push(
      "DATABASE_URL is not set. In production a persistent database is required; " +
        "SQLite in /tmp is ephemeral on serverless and will lose data between invocations.",
    );
  }

  // Recommended configuration — features degrade gracefully without them.
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    warnings.push("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — online payments will be unavailable.");
  }

  const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  if (!hasSmtp && !hasResend) {
    warnings.push("No email transport configured (set RESEND_API_KEY or SMTP_* vars) — transactional emails will not be sent.");
  }

  if (isProduction && !process.env.NEXT_PUBLIC_APP_URL) {
    warnings.push("NEXT_PUBLIC_APP_URL not set — links in emails and CSRF origin allow-listing may be incorrect.");
  }

  return { errors, warnings };
}

/**
 * Runs validation and reports results. Throws in production when a critical
 * variable is missing so the deployment fails fast rather than serving a
 * broken app.
 */
export function assertEnv(): void {
  const { errors, warnings } = validateEnv();

  for (const warning of warnings) {
    logger.warn(`[ENV] ${warning}`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      logger.error(`[ENV] ${error}`);
    }
    if (isProduction) {
      throw new Error(`Invalid environment configuration:\n- ${errors.join("\n- ")}`);
    }
  }
}
