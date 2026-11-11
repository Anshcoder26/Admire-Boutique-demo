import { NextRequest, NextResponse } from "next/server";
import {
  createReview,
  getCustomerPurchases,
  getProductById,
  getReviewSummary,
  hasExistingReview,
  listReviews,
  validateUserSessionToken,
  type ReviewRecord,
} from "@/lib/db";
import { AUTH_RATE_LIMITS } from "@/lib/auth-utils";
import { checkRateLimit, tooManyRequests } from "@/lib/rate-limiter";
import { reviewerDisplayName, reviewPhotoUrl, validateReviewInput } from "@/lib/reviews";

/** Public shape of an approved review: photo links instead of photo data. */
function toPublicReview(review: ReviewRecord) {
  return {
    id: review.id,
    name: review.customerName,
    productId: review.productId,
    productName: review.productName,
    rating: review.rating,
    title: review.title,
    body: review.body,
    photos: Array.from({ length: review.photoCount }, (_, index) => reviewPhotoUrl(review.id, index)),
    verifiedBuyer: review.verifiedBuyer,
    reply: review.reply,
    replyAt: review.replyAt,
    createdAt: review.createdAt,
  };
}

// GET /api/reviews?productId=...&limit=... : approved reviews, newest first.
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId") || undefined;
  const limit = Number(request.nextUrl.searchParams.get("limit")) || 50;
  const [reviews, summary] = await Promise.all([listReviews({ productId, limit }), getReviewSummary(productId)]);
  return NextResponse.json(
    { success: true, reviews: reviews.map(toPublicReview), summary },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// POST /api/reviews : a signed-in customer with a real order posts a review; it goes live at once.
export async function POST(request: NextRequest) {
  const token = request.cookies.get("admire-session")?.value || "";
  const customer = token ? await validateUserSessionToken(token) : null;
  if (!customer) {
    return NextResponse.json({ error: "Please sign in to write a review." }, { status: 401 });
  }

  // Count every attempt before parsing the (photo-heavy) body or querying anything,
  // so refused attempts can't be repeated for free.
  const rate = await checkRateLimit(`review:${customer.id}`, AUTH_RATE_LIMITS.review.maxAttempts, AUTH_RATE_LIMITS.review.windowMs);
  if (!rate.allowed) return tooManyRequests(rate.retryAfter);

  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const checked = validateReviewInput(raw);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error }, { status: 400 });
  }

  const purchases = await getCustomerPurchases(customer.id);
  if (!purchases.hasOrder) {
    return NextResponse.json(
      { error: "Reviews are open to customers who have placed an order with us." },
      { status: 403 }
    );
  }

  let productId: string | null = null;
  let productName: string | null = null;
  if (raw && typeof raw.productId === "string" && raw.productId) {
    const product = await getProductById(raw.productId);
    if (!product) {
      return NextResponse.json({ error: "This product could not be found." }, { status: 404 });
    }
    productId = product.id;
    productName = product.name;
  }

  const alreadyReviewed = () =>
    NextResponse.json(
      {
        error: productId
          ? "You have already reviewed this product. Thank you!"
          : "You have already reviewed the boutique. Thank you!",
      },
      { status: 409 }
    );

  // Friendly early answer; the database's unique index is what actually guarantees one review.
  if (await hasExistingReview(customer.id, productId)) return alreadyReviewed();

  const created = await createReview({
    customerId: customer.id,
    customerName: reviewerDisplayName(customer.name),
    productId,
    productName,
    ...checked.value,
    // A store review needs an order already; a product review needs that product in an order.
    verifiedBuyer: productId ? purchases.productIds.includes(productId) : true,
  });
  if (!created) return alreadyReviewed();

  return NextResponse.json({ success: true, message: "Thank you! Your review is now live." }, { status: 201 });
}
