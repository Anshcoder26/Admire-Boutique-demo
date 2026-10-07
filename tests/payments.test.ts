import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  computePaymentExpiry,
  extractPaidEvent,
  getPaymentWindowMinutes,
  isValidCheckoutSignature,
  isValidWebhookSignature,
  secondsUntil,
} from "../src/lib/payment-utils.ts";

const hmac = (secret: string, data: string) => crypto.createHmac("sha256", secret).update(data).digest("hex");

test("payment window defaults to 15 minutes and honours a valid override", () => {
  const original = process.env.PAYMENT_WINDOW_MINUTES;
  try {
    delete process.env.PAYMENT_WINDOW_MINUTES;
    assert.equal(getPaymentWindowMinutes(), 15);
    process.env.PAYMENT_WINDOW_MINUTES = "30";
    assert.equal(getPaymentWindowMinutes(), 30);
    process.env.PAYMENT_WINDOW_MINUTES = "0.5";
    assert.equal(getPaymentWindowMinutes(), 0.5);
    for (const bad of ["0", "-5", "abc", ""]) {
      process.env.PAYMENT_WINDOW_MINUTES = bad;
      assert.equal(getPaymentWindowMinutes(), 15, `fallback for ${JSON.stringify(bad)}`);
    }
  } finally {
    if (original === undefined) delete process.env.PAYMENT_WINDOW_MINUTES;
    else process.env.PAYMENT_WINDOW_MINUTES = original;
  }
});

test("computePaymentExpiry and secondsUntil", () => {
  const now = new Date("2026-01-01T10:00:00.000Z");
  const expiry = computePaymentExpiry(now, 15);
  assert.equal(expiry, "2026-01-01T10:15:00.000Z");
  assert.equal(secondsUntil(expiry, now), 900);
  assert.equal(secondsUntil(expiry, new Date("2026-01-01T10:14:59.500Z")), 0);
  assert.equal(secondsUntil(expiry, new Date("2026-01-01T10:20:00.000Z")), 0);
  assert.equal(secondsUntil(null, now), 0);
  assert.equal(secondsUntil("not-a-date", now), 0);
});

test("expiry timestamps sort lexically in time order (DB comparisons rely on it)", () => {
  const a = computePaymentExpiry(new Date("2026-01-01T09:59:59.000Z"), 15);
  const b = computePaymentExpiry(new Date("2026-01-01T10:00:00.000Z"), 15);
  assert.ok(a < b);
});

test("checkout signature verification", () => {
  const secret = "key_secret";
  const sig = hmac(secret, "order_ABC|pay_123");
  assert.equal(isValidCheckoutSignature("order_ABC", "pay_123", sig, secret), true);
  assert.equal(isValidCheckoutSignature("order_ABC", "pay_999", sig, secret), false, "different payment");
  assert.equal(isValidCheckoutSignature("order_XYZ", "pay_123", sig, secret), false, "different order");
  assert.equal(isValidCheckoutSignature("order_ABC", "pay_123", sig, "other"), false, "wrong secret");
  assert.equal(isValidCheckoutSignature("order_ABC", "pay_123", "", secret), false, "empty signature");
  assert.equal(isValidCheckoutSignature("order_ABC", "pay_123", sig.slice(0, 10), secret), false, "truncated");
  assert.equal(isValidCheckoutSignature("order_ABC", "pay_123", sig, ""), false, "missing secret");
});

test("webhook signature verification uses the exact raw body", () => {
  const secret = "whsec";
  const raw = JSON.stringify({ event: "payment.captured", payload: {} });
  const sig = hmac(secret, raw);
  assert.equal(isValidWebhookSignature(raw, sig, secret), true);
  assert.equal(isValidWebhookSignature(raw + " ", sig, secret), false, "body changed");
  assert.equal(isValidWebhookSignature(raw, null, secret), false, "no header");
  assert.equal(isValidWebhookSignature(raw, sig, ""), false, "no secret configured");
});

test("extractPaidEvent picks out paid events only", () => {
  const entity = { id: "pay_1", order_id: "order_1", status: "captured" };
  assert.deepEqual(extractPaidEvent({ event: "payment.captured", payload: { payment: { entity } } }), {
    razorpayOrderId: "order_1",
    razorpayPaymentId: "pay_1",
  });
  assert.deepEqual(extractPaidEvent({ event: "order.paid", payload: { payment: { entity }, order: { entity: {} } } }), {
    razorpayOrderId: "order_1",
    razorpayPaymentId: "pay_1",
  });
  assert.equal(extractPaidEvent({ event: "payment.failed", payload: { payment: { entity } } }), null);
  assert.equal(extractPaidEvent({ event: "payment.authorized", payload: { payment: { entity } } }), null);
  assert.equal(extractPaidEvent({ event: "payment.captured", payload: { payment: { entity: { id: "pay_1" } } } }), null);
  assert.equal(extractPaidEvent(null), null);
  assert.equal(extractPaidEvent("garbage"), null);
});
