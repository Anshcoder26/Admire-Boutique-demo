import { test } from "node:test";
import assert from "node:assert/strict";
import { codBalanceDue, codHoldDeadline, isCodHoldOver, readCodPaymentDetails } from "../src/lib/cod.ts";
import {
  buildBodyTemplate,
  buildCodAdvanceRequestEmail,
  buildOwnerCodOrderEmail,
  codAdvanceRequestValues,
  ownerAlertValues,
} from "../src/lib/notifications/cod-messages.ts";

const payment = { upiId: "shop@upi", screenshotWhatsapp: "+91 84459 14777", supportPhone: "+91 84459 14777" };

test("the balance is the total less the advance and never goes negative", () => {
  assert.equal(codBalanceDue(2048), 1548);
  assert.equal(codBalanceDue(2048, 500), 1548);
  assert.equal(codBalanceDue(300), 0);
});

test("the stock hold ends 48 hours after the order, for SQLite and Postgres timestamps", () => {
  assert.equal(codHoldDeadline("2026-11-09 10:00:00"), "2026-11-11T10:00:00.000Z");
  assert.equal(codHoldDeadline("2026-11-09T10:00:00.000Z"), "2026-11-11T10:00:00.000Z");
  assert.equal(codHoldDeadline(new Date("2026-11-09T10:00:00.000Z")), "2026-11-11T10:00:00.000Z");
  assert.equal(codHoldDeadline("not-a-date"), null);
});

test("the hold is over only once 48 hours have passed", () => {
  const created = "2026-11-09T10:00:00.000Z";
  assert.equal(isCodHoldOver(created, new Date("2026-11-11T09:59:59.000Z")), false);
  assert.equal(isCodHoldOver(created, new Date("2026-11-11T10:00:00.000Z")), true);
  assert.equal(isCodHoldOver(null), false);
});

test("COD settings fall back to the order line and leave the UPI ID empty until set", () => {
  const original = process.env.COD_UPI_ID;
  try {
    delete process.env.COD_UPI_ID;
    assert.equal(readCodPaymentDetails().upiId, "");
    assert.equal(readCodPaymentDetails().screenshotWhatsapp, "+91 92593 14348");
    assert.equal(readCodPaymentDetails().supportPhone, "+91 92593 14348");
    process.env.COD_UPI_ID = " shop@upi ";
    assert.equal(readCodPaymentDetails().upiId, "shop@upi");
  } finally {
    if (original === undefined) delete process.env.COD_UPI_ID;
    else process.env.COD_UPI_ID = original;
  }
});

test("the advance request template fills its variables in order", () => {
  assert.deepEqual(codAdvanceRequestValues("AB-1", payment), ["shop@upi", "AB-1", "+91 84459 14777", "+91 84459 14777"]);
});

test("template values are stripped of newlines and repeated spaces, which WhatsApp rejects", () => {
  const message = buildBodyTemplate("919876543210", "owner_new_order", { languageCode: "en" }, ["Asha\n  Rao", ""]);
  assert.equal(message.template.name, "owner_new_order");
  assert.deepEqual(message.template.components[0].parameters.map((p) => p.text), ["Asha Rao", "-"]);
});

test("the owner alert lists order, customer, amount and method", () => {
  assert.deepEqual(
    ownerAlertValues({ orderNumber: "AB-1", customerName: "Asha", total: 2048, paymentMethod: "Razorpay" }),
    ["AB-1", "Asha", "₹2,048", "Razorpay"]
  );
});

test("the customer email states the advance and balance, and escapes user data", () => {
  const email = buildCodAdvanceRequestEmail({ customerName: "Asha <b>", orderNumber: "AB-1", total: 2048, advance: 500, payment });
  assert.match(email.subject, /₹500/);
  assert.match(email.html, /shop@upi/);
  assert.match(email.html, /₹1,548/);
  assert.match(email.html, /Asha &lt;b&gt;/);
});

test("the customer email doesn't print an empty UPI ID", () => {
  const email = buildCodAdvanceRequestEmail({ customerName: "Asha", orderNumber: "AB-1", total: 2048, advance: 500, payment: { ...payment, upiId: "" } });
  assert.match(email.html, /share this with you on WhatsApp/);
});

test("the owner COD email includes what to ship and where", () => {
  const email = buildOwnerCodOrderEmail({
    orderNumber: "AB-1",
    customerName: "Asha",
    customerEmail: "a@example.com",
    customerPhone: "9876543210",
    total: 2048,
    advance: 500,
    items: [{ name: "Silk Suit", size: "Unstitched", quantity: 2 }],
    addressLine: "1 Test St, Agra",
    dashboardUrl: "https://example.com/admin",
  });
  assert.match(email.html, /Silk Suit \(Unstitched\) × 2/);
  assert.match(email.html, /1 Test St, Agra/);
});
