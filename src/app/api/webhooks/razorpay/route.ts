import { NextResponse, after } from "next/server";
import { getOrderByRazorpayOrderId } from "@/lib/db";
import { captureException } from "@/lib/error-tracking";
import { markOrderPaid, notifyPaymentOutcome } from "@/lib/payments";
import { extractPaidEvent, isValidWebhookSignature } from "@/lib/payment-utils";

/**
 * Razorpay webhook: a server-to-server backup for the checkout callback, so a
 * payment is recorded even if the customer's tab closes or loses network
 * right after paying. Subscribe to `payment.captured` and `order.paid`.
 *
 * Authenticated by X-Razorpay-Signature (HMAC-SHA256 of the raw body with
 * RAZORPAY_WEBHOOK_SECRET). Responds 2xx for anything we've handled or don't
 * care about, so Razorpay doesn't keep retrying; 5xx only on our own errors.
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret) {
    console.error("[RAZORPAY WEBHOOK] RAZORPAY_WEBHOOK_SECRET is not set; rejecting webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  if (!isValidWebhookSignature(rawBody, request.headers.get("x-razorpay-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paid = extractPaidEvent(payload);
  if (!paid) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const order = await getOrderByRazorpayOrderId(paid.razorpayOrderId);
    if (!order) {
      // Not one of ours (e.g. a payment link or another integration).
      console.warn("[RAZORPAY WEBHOOK] No order for Razorpay order", paid.razorpayOrderId);
      return NextResponse.json({ received: true, ignored: true });
    }

    const outcome = await markOrderPaid(order.id, paid, "webhook");
    after(() => notifyPaymentOutcome(outcome, order.id));
    return NextResponse.json({ received: true, outcome });
  } catch (error) {
    console.error("[RAZORPAY WEBHOOK] Error:", error);
    void captureException(error, { route: "webhooks/razorpay" });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
