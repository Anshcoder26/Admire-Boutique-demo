import crypto from "node:crypto";

/**
 * Pure helpers for online payments (no database access, so they're unit-testable).
 */

/** Minutes an unpaid online order holds its stock before being auto-cancelled. */
export function getPaymentWindowMinutes(): number {
  const value = Number(process.env.PAYMENT_WINDOW_MINUTES);
  return Number.isFinite(value) && value > 0 ? value : 15;
}

export function computePaymentExpiry(now: Date = new Date(), windowMinutes = getPaymentWindowMinutes()): string {
  return new Date(now.getTime() + windowMinutes * 60_000).toISOString();
}

/** Whole seconds left until `expiresAt` (0 when expired or invalid). */
export function secondsUntil(expiresAt: string | null | undefined, now: Date = new Date()): number {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - now.getTime();
  return Number.isFinite(ms) && ms > 0 ? Math.floor(ms / 1000) : 0;
}

function timingSafeEqualHex(expectedHex: string, providedHex: string): boolean {
  const expected = Buffer.from(expectedHex, "utf8");
  const provided = Buffer.from(providedHex || "", "utf8");
  return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
}

/** Checkout signature: HMAC-SHA256("<razorpay_order_id>|<razorpay_payment_id>", key secret). */
export function isValidCheckoutSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  keySecret: string
): boolean {
  if (!keySecret) return false;
  const expected = crypto.createHmac("sha256", keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

/** Webhook signature: HMAC-SHA256(raw request body, webhook secret) in X-Razorpay-Signature. */
export function isValidWebhookSignature(rawBody: string, signature: string | null, webhookSecret: string): boolean {
  if (!webhookSecret || !signature) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

/**
 * Pull the Razorpay order/payment ids out of a webhook payload for the events
 * that mean "money received" (payment.captured, order.paid). Returns null for
 * anything else.
 */
export function extractPaidEvent(payload: unknown): { razorpayOrderId: string; razorpayPaymentId: string } | null {
  const body = payload as {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } };
  };
  if (body?.event !== "payment.captured" && body?.event !== "order.paid") return null;
  const payment = body.payload?.payment?.entity;
  if (!payment?.id || !payment.order_id) return null;
  return { razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id };
}
