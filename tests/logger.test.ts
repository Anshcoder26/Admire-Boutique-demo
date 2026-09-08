import { test } from "node:test";
import assert from "node:assert/strict";
import { redact } from "../src/lib/logger.ts";

test("redacts sensitive keys", () => {
  const out = redact({
    email: "user@example.com",
    password: "hunter2",
    razorpay_signature: "abc123",
    token: "secret-token",
    apiKey: "k",
  }) as Record<string, unknown>;

  assert.equal(out.email, "user@example.com");
  assert.equal(out.password, "[REDACTED]");
  assert.equal(out.razorpay_signature, "[REDACTED]");
  assert.equal(out.token, "[REDACTED]");
  assert.equal(out.apiKey, "[REDACTED]");
});

test("redacts nested sensitive keys", () => {
  const out = redact({ payment: { secret: "x", amount: 100 } }) as Record<string, any>;
  assert.equal(out.payment.secret, "[REDACTED]");
  assert.equal(out.payment.amount, 100);
});

test("serializes Error to name and message only", () => {
  const out = redact(new Error("boom")) as Record<string, unknown>;
  assert.equal(out.name, "Error");
  assert.equal(out.message, "boom");
});

test("passes through primitives", () => {
  assert.equal(redact("hello"), "hello");
  assert.equal(redact(42), 42);
  assert.equal(redact(null), null);
});
