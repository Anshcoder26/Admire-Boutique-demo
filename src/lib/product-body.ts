import { NextResponse } from "next/server";

// Matches the default proxyClientMaxBodySize: Next.js only buffers the first
// 10MB of a request that passes through the proxy, so anything larger arrives cut off.
export const MAX_PRODUCT_BODY_BYTES = 10 * 1024 * 1024;

type ReadResult = { ok: true; body: Record<string, unknown> } | { ok: false; response: NextResponse };

export async function readProductBody(request: Request): Promise<ReadResult> {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_PRODUCT_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Photos are too large. Please use fewer or smaller photos (under 10 MB in total)." },
        { status: 413 },
      ),
    };
  }

  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return { ok: true, body: body as Record<string, unknown> };
    }
  } catch {
    // Falls through to the 400 below.
  }

  return {
    ok: false,
    response: NextResponse.json(
      { error: "Couldn't read the product details. If you added many photos, try fewer or smaller ones." },
      { status: 400 },
    ),
  };
}
