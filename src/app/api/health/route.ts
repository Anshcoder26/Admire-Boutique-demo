import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Health probe: reports database connectivity and basic build info.
 * Returns 200 when the database is reachable, 503 otherwise.
 */
export async function GET() {
  const db = await pingDatabase();

  const body = {
    status: db.ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: { backend: db.backend, ok: db.ok, ...(db.error ? { error: db.error } : {}) },
    build: {
      env: process.env.NODE_ENV ?? "unknown",
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      region: process.env.VERCEL_REGION ?? null,
    },
  };

  return NextResponse.json(body, { status: db.ok ? 200 : 503 });
}
