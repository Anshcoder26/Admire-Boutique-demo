import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeWhatsAppNumber, buildTemplateMessage } from "../src/lib/notifications/whatsapp-channel.ts";
import { buildCustomerEmail, buildOwnerEmail, escapeHtml } from "../src/lib/notifications/email-channel.ts";
import { dispatchToChannels } from "../src/lib/notifications/dispatcher.ts";
import type { NotificationChannel, OrderNotification } from "../src/lib/notifications/types.ts";

const sample: OrderNotification = {
  event: "payment_received",
  orderId: "ord-1",
  orderNumber: "AB-20261006-ABCD1234",
  customer: { name: "Asha <b>", email: "asha@example.com", phone: "98765 43210" },
  items: [{ name: "Saffron Silk Kurti", size: "M", quantity: 1, price: 1899 }],
  subtotal: 1899,
  shipping: 149,
  discount: 0,
  total: 2048,
  paymentMethod: "Razorpay",
  paymentStatus: "Paid",
  invoice: { filename: "Invoice-AB-20261006-ABCD1234.pdf", content: Buffer.from("%PDF") },
};

test("normalizes Indian numbers to international digits", () => {
  assert.equal(normalizeWhatsAppNumber("9876543210"), "919876543210");
  assert.equal(normalizeWhatsAppNumber("98765 43210"), "919876543210");
  assert.equal(normalizeWhatsAppNumber("09876543210"), "919876543210");
  assert.equal(normalizeWhatsAppNumber("919876543210"), "919876543210");
  assert.equal(normalizeWhatsAppNumber("+91 98765-43210"), "919876543210");
});

test("keeps explicit international numbers", () => {
  assert.equal(normalizeWhatsAppNumber("+1 415 555 0100"), "14155550100");
  assert.equal(normalizeWhatsAppNumber("0044 7911 123456"), "447911123456");
});

test("rejects numbers that can't be interpreted", () => {
  assert.equal(normalizeWhatsAppNumber(""), null);
  assert.equal(normalizeWhatsAppNumber(undefined), null);
  assert.equal(normalizeWhatsAppNumber("12345"), null);
  assert.equal(normalizeWhatsAppNumber("+12"), null);
});

test("builds a template message with invoice header and body variables", () => {
  const config = { languageCode: "en", templates: { payment_received: "payment_receipt" } };
  const msg = buildTemplateMessage(sample, "919876543210", config, "media-123");

  assert.equal(msg.to, "919876543210");
  assert.equal(msg.template.name, "payment_receipt");
  assert.deepEqual(msg.template.language, { code: "en" });
  assert.deepEqual(msg.template.components[0], {
    type: "header",
    parameters: [{ type: "document", document: { id: "media-123", filename: sample.invoice!.filename } }],
  });
  const body = msg.template.components[1] as { parameters: Array<{ text: string }> };
  assert.deepEqual(body.parameters.map((p) => p.text), ["Asha <b>", sample.orderNumber, "₹2,048"]);
});

test("omits the header when there is no invoice upload", () => {
  const config = { languageCode: "en", templates: { payment_received: "payment_receipt" } };
  const msg = buildTemplateMessage(sample, "919876543210", config);

  assert.equal(msg.template.name, "payment_receipt");
  assert.equal(msg.template.components.length, 1);
  assert.equal(msg.template.components[0].type, "body");
});

test("customer email escapes user data and confirms the payment", () => {
  const paid = buildCustomerEmail(sample);
  assert.match(paid.subject, /Payment received/);
  assert.match(paid.html, /Asha &lt;b&gt;/);
  assert.doesNotMatch(paid.html, /Asha <b>/);
  assert.match(paid.html, /Amount paid/);
  assert.doesNotMatch(paid.html, /on delivery/i);
  assert.equal(escapeHtml(`"'&`), "&quot;&#39;&amp;");
});

test("owner email announces the online payment, never COD", () => {
  const owner = buildOwnerEmail(sample);
  assert.match(owner.subject, /Payment received: AB-20261006-ABCD1234/);
  assert.doesNotMatch(owner.subject + owner.html, /COD|Cash.on.Delivery/i);
});

test("dispatcher isolates channel failures and skips unconfigured channels", async () => {
  const sent: string[] = [];
  const channel = (name: string, configured: boolean, fail = false): NotificationChannel => ({
    name,
    isConfigured: () => configured,
    send: async () => {
      if (fail) throw new Error(`${name} down`);
      sent.push(name);
    },
  });

  const results = await dispatchToChannels(sample, [
    channel("email", true, true),
    channel("whatsapp", true),
    channel("sms", false),
  ]);

  assert.deepEqual(sent, ["whatsapp"]);
  assert.deepEqual(
    results.map((r) => [r.channel, r.status]),
    [["email", "failed"], ["whatsapp", "sent"], ["sms", "skipped"]]
  );
  assert.equal(results[0].error, "email down");
});
