import { NextResponse } from "next/server";
import { getProductReviewSummaries } from "@/lib/db";

// GET /api/reviews/summary : { [productId]: { count, average } } from live customer reviews.
export async function GET() {
  return NextResponse.json(
    { success: true, summaries: await getProductReviewSummaries() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
