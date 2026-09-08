export async function register() {
  // Only run environment validation on the Node.js server runtime, not on the
  // Edge runtime (where some Node APIs and env vars are unavailable).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertEnv } = await import("@/lib/env");
    assertEnv();

    // Opportunistic housekeeping on cold start — prune expired sessions,
    // password-reset tokens, and rate-limit counters.
    const { cleanupExpiredRows } = await import("@/lib/db");
    await cleanupExpiredRows();
  }
}
