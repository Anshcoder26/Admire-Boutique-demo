import { codBalanceDue, type CodPaymentDetails } from "@/lib/cod";
import { escapeHtml } from "@/lib/notifications/email-channel";

/** Message content for Cash on Delivery orders and owner alerts (pure, so it's unit-testable). */

export type TemplateConfig = { languageCode: string };

export type OrderAlertDetails = {
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
};

const inr = (value: number) => `₹${Number(value).toLocaleString("en-IN")}`;

export function codTemplateNames() {
  return {
    advanceRequest: process.env.WHATSAPP_TEMPLATE_COD_ADVANCE_REQUEST || "cod_advance_request",
    advanceVerified: process.env.WHATSAPP_TEMPLATE_COD_ADVANCE_VERIFIED || "cod_advance_verified",
    ownerNewOrder: process.env.WHATSAPP_TEMPLATE_OWNER_NEW_ORDER || "owner_new_order",
  };
}

/** WhatsApp rejects template values containing newlines, tabs or runs of spaces. */
function templateValue(value: string): string {
  return value.replace(/\s+/g, " ").trim() || "-";
}

export function buildBodyTemplate(to: string, templateName: string, config: TemplateConfig, values: string[]) {
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: config.languageCode },
      components: [
        {
          type: "body",
          parameters: values.map((value) => ({ type: "text", text: templateValue(value) })),
        },
      ],
    },
  };
}

/** Body variables, in order, for the owner_new_order template. */
export function ownerAlertValues(alert: OrderAlertDetails): string[] {
  return [alert.orderNumber, alert.customerName || "Customer", inr(alert.total), alert.paymentMethod];
}

/** Body variables, in order, for the cod_advance_request template. */
export function codAdvanceRequestValues(orderNumber: string, payment: CodPaymentDetails): string[] {
  return [payment.upiId, orderNumber, payment.screenshotWhatsapp, payment.supportPhone];
}

function emailShell(heading: string, body: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;">
  <div style="background:#7D1D1D;color:#fff;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:24px;">${heading}</h1>
  </div>
  <div style="background:#f9f9f9;padding:24px;border:1px solid #eee;border-radius:0 0 8px 8px;line-height:1.6;">${body}</div>
</div>`;
}

export function buildCodAdvanceRequestEmail(input: {
  customerName: string;
  orderNumber: string;
  total: number;
  advance: number;
  payment: CodPaymentDetails;
}): { subject: string; html: string } {
  const { payment } = input;
  const upiLine = payment.upiId
    ? `<strong>UPI ID:</strong> ${escapeHtml(payment.upiId)}`
    : "<strong>UPI ID:</strong> we will share this with you on WhatsApp shortly";

  return {
    subject: `Pay ${inr(input.advance)} to confirm your order ${input.orderNumber}`,
    html: emailShell(
      "Thank you for your order!",
      `<p>Hi ${escapeHtml(input.customerName || "there")},</p>
      <p>Thank you for choosing <strong>Admire Boutique</strong>. Since you selected <strong>Cash on Delivery</strong>, we request an advance payment of <strong>${inr(input.advance)}</strong> to confirm your order.</p>
      <p>This is not an additional charge. It is adjusted against your order total of ${inr(input.total)}, and you pay the remaining <strong>${inr(codBalanceDue(input.total, input.advance))}</strong> on delivery.</p>
      <p style="background:#fff;padding:14px;border-left:4px solid #7D1D1D;">
        ${upiLine}<br>
        <strong>Amount:</strong> ${inr(input.advance)}<br>
        <strong>Order ID:</strong> ${escapeHtml(input.orderNumber)}
      </p>
      <p>Once you have paid through GPay or any UPI app, please share a screenshot of the successful transaction on WhatsApp at <strong>${escapeHtml(payment.screenshotWhatsapp)}</strong> so our team can verify it and confirm your order.</p>
      <p>For any questions, contact us at <strong>${escapeHtml(payment.supportPhone)}</strong>.</p>`
    ),
  };
}

export function buildCodAdvanceVerifiedEmail(input: {
  customerName: string;
  orderNumber: string;
  total: number;
  advance: number;
}): { subject: string; html: string } {
  return {
    subject: `Your order ${input.orderNumber} is confirmed`,
    html: emailShell(
      "Your order is confirmed",
      `<p>Hi ${escapeHtml(input.customerName || "there")},</p>
      <p>We have verified your advance of <strong>${inr(input.advance)}</strong> for order <strong>${escapeHtml(input.orderNumber)}</strong>. Your order will now be prepared for processing and shipping.</p>
      <p>Please keep <strong>${inr(codBalanceDue(input.total, input.advance))}</strong> ready to pay on delivery.</p>
      <p>Thank you for shopping with Admire Boutique!</p>`
    ),
  };
}

export function buildOwnerCodOrderEmail(input: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  advance: number;
  items: Array<{ name: string; size?: string; quantity: number }>;
  addressLine: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const items = input.items
    .map((item) => `<li>${escapeHtml(item.name)}${item.size ? ` (${escapeHtml(item.size)})` : ""} × ${item.quantity}</li>`)
    .join("");

  return {
    subject: `New COD order: ${input.orderNumber} (${inr(input.total)}) - awaiting ${inr(input.advance)} advance`,
    html: `<h2>New Cash on Delivery order</h2>
      <p><strong>Order:</strong> ${escapeHtml(input.orderNumber)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(input.customerName)} (${escapeHtml(input.customerEmail)}, ${escapeHtml(input.customerPhone || "no phone")})</p>
      <p><strong>Total:</strong> ${inr(input.total)}. <strong>Advance due:</strong> ${inr(input.advance)}</p>
      <ul>${items}</ul>
      <p><strong>Ship to:</strong> ${escapeHtml(input.addressLine)}</p>
      <p>Do not pack or ship until the advance is verified. <a href="${input.dashboardUrl}">Open the owner dashboard</a></p>`,
  };
}
