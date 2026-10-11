import { test } from "node:test";
import assert from "node:assert/strict";
import { ORDER_STATUSES, PAYMENT_STATUSES, validateAdminOrderUpdate } from "../src/lib/order-status.ts";

test("owner can move an order between the normal fulfilment statuses", () => {
  for (const from of [...ORDER_STATUSES, "Processing"]) {
    for (const to of ORDER_STATUSES) {
      assert.equal(validateAdminOrderUpdate(from, { status: to }), null, `${from} -> ${to}`);
    }
  }
});

test("orders can never be cancelled from the admin panel", () => {
  for (const from of ORDER_STATUSES) {
    const result = validateAdminOrderUpdate(from, { status: "Cancelled" });
    assert.equal(result?.status, 400, `${from} -> Cancelled`);
  }
});

test("unknown or malformed statuses are rejected", () => {
  for (const bad of ["Lost", "confirmed", "Awaiting Payment", 42, ["Shipped"], { s: 1 }]) {
    assert.equal(validateAdminOrderUpdate("Confirmed", { status: bad })?.status, 400, JSON.stringify(bad));
  }
});

test("system-managed orders (awaiting payment, cancelled) can't be moved by hand", () => {
  for (const from of ["Awaiting Payment", "Cancelled"]) {
    const result = validateAdminOrderUpdate(from, { status: "Shipped" });
    assert.equal(result?.status, 409, from);
  }
});

test("payment status must be one of the known values", () => {
  for (const ok of PAYMENT_STATUSES) {
    assert.equal(validateAdminOrderUpdate("Confirmed", { paymentStatus: ok }), null, ok);
  }
  for (const bad of ["paid", "Chargeback", 1]) {
    assert.equal(validateAdminOrderUpdate("Confirmed", { paymentStatus: bad })?.status, 400, String(bad));
  }
});

test("payment status can still be updated on system-managed orders", () => {
  assert.equal(validateAdminOrderUpdate("Cancelled", { paymentStatus: "Refunded" }), null);
});

test("a valid status paired with an invalid payment status is rejected as a whole", () => {
  assert.equal(validateAdminOrderUpdate("Confirmed", { status: "Packed", paymentStatus: "Bogus" })?.status, 400);
});
