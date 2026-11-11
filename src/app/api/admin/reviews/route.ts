import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/admin-auth";
import { listReviews, setReviewRemoved, setReviewReply } from "@/lib/db";
import { cleanReviewReply, isRemovalReason, reviewPhotoUrl } from "@/lib/reviews";

// GET /api/admin/reviews?status=live|removed
export async function GET(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = request.nextUrl.searchParams.get("status") === "removed" ? "removed" : "approved";
  const reviews = await listReviews({ status, limit: 200 });
  return NextResponse.json({
    success: true,
    reviews: reviews.map((review) => ({
      ...review,
      photos: Array.from({ length: review.photoCount }, (_, index) => reviewPhotoUrl(review.id, index)),
    })),
  });
}

// POST /api/admin/reviews
//   { id, action: "remove", reason }  take down for one of the allowed reasons
//   { id, action: "restore" }         put a removed review back
//   { id, action: "reply", reply }    set the public reply ("" removes it)
export async function POST(request: Request) {
  const admin = await authenticateAdmin(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { id?: unknown; action?: unknown; reason?: unknown; reply?: unknown };
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  let done: boolean;
  if (body.action === "remove" || body.action === "restore") {
    // A bad rating is not a reason: only the published reasons are accepted.
    if (body.action === "remove" && !isRemovalReason(body.reason)) {
      return NextResponse.json({ error: "Choose one of the listed reasons." }, { status: 400 });
    }
    const result = await setReviewRemoved(id, body.action === "remove" ? (body.reason as string) : null);
    if (result === "conflict") {
      return NextResponse.json(
        { error: "This customer has since posted a newer review of the same item, so this one can't be restored." },
        { status: 409 }
      );
    }
    done = result === "ok";
  } else if (body.action === "reply") {
    const reply = cleanReviewReply(body.reply);
    if (!reply.ok) return NextResponse.json({ error: reply.error }, { status: 400 });
    done = await setReviewReply(id, reply.value);
  } else {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!done) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
