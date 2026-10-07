import { getAppUrl, isEmailConfigured, sendEmailOrThrow } from "@/lib/email-service";
import type { NotificationChannel, OrderNotification } from "@/lib/notifications/types";

const inr = (value: number) => `₹${Number(value).toLocaleString("en-IN")}`;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCustomerEmail(n: OrderNotification): { subject: string; html: string } {
  const paid = n.event === "payment_received";
  const subject = paid
    ? `Payment received – Order ${n.orderNumber}`
    : `Order confirmed – ${n.orderNumber}`;
  const heading = paid ? "Payment received" : "Order confirmed";
  const intro = paid
    ? `We've received your payment of <strong>${inr(n.total)}</strong>. Your receipt is attached to this email.`
    : `Your order has been placed. Please keep <strong>${inr(n.total)}</strong> ready to pay on delivery. Your invoice is attached to this email.`;

  const rows = n.items
    .map(
      (item) => `<tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">${escapeHtml(item.name)}${item.size ? ` <span style="color:#888;">(${escapeHtml(item.size)})</span>` : ""}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">×${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${inr(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const summaryRow = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 10px;${bold ? "font-weight:bold;color:#7D1D1D;font-size:16px;" : "color:#555;"}">${label}</td>
     <td style="padding:4px 10px;text-align:right;${bold ? "font-weight:bold;color:#7D1D1D;font-size:16px;" : ""}">${value}</td></tr>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#333;margin:0;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#7D1D1D;color:#fff;padding:28px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:26px;">${heading}</h1>
      <p style="margin:6px 0 0;font-size:14px;">Thank you for shopping with Admire Boutique</p>
    </div>
    <div style="background:#f9f9f9;padding:28px;border:1px solid #eee;border-radius:0 0 8px 8px;">
      <p>Hi ${escapeHtml(n.customer.name)},</p>
      <p>${intro}</p>
      <div style="background:#fff;padding:14px;border-left:4px solid #7D1D1D;margin:20px 0;">
        <div style="font-size:12px;color:#888;text-transform:uppercase;">Order number</div>
        <div style="font-size:20px;font-weight:bold;color:#7D1D1D;">${escapeHtml(n.orderNumber)}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f0f0f0;">
          <th style="padding:10px;text-align:left;">Product</th>
          <th style="padding:10px;text-align:center;">Qty</th>
          <th style="padding:10px;text-align:right;">Amount</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <table style="width:100%;margin-top:12px;background:#fff;border-radius:8px;">
        ${summaryRow("Subtotal", inr(n.subtotal))}
        ${summaryRow("Shipping", n.shipping ? inr(n.shipping) : "Free")}
        ${n.discount ? summaryRow("Discount", `−${inr(n.discount)}`) : ""}
        ${summaryRow(paid ? "Amount paid" : "Amount due on delivery", inr(n.total), true)}
      </table>
      <p style="margin-top:20px;line-height:1.6;">
        <strong>Payment:</strong> ${escapeHtml(n.paymentMethod)} (${escapeHtml(n.paymentStatus)})<br>
        <strong>Delivery:</strong> ${escapeHtml(n.estimatedDelivery || "4–7 business days")}
      </p>
      <a href="${getAppUrl()}/orders" style="display:inline-block;background:#7D1D1D;color:#fff;padding:12px 28px;text-decoration:none;border-radius:25px;margin-top:10px;">Track your order</a>
      <p style="text-align:center;margin-top:24px;color:#888;font-size:12px;">
        Questions? Reply to this email or visit ${getAppUrl()}/support<br>
        &copy; ${new Date().getFullYear()} Admire Boutique
      </p>
    </div>
  </div>
</body></html>`;

  return { subject, html };
}

export function buildOwnerEmail(n: OrderNotification): { subject: string; html: string } {
  const paid = n.event === "payment_received";
  return {
    subject: paid ? `Payment received: ${n.orderNumber} (${inr(n.total)})` : `New COD order: ${n.orderNumber} (${inr(n.total)})`,
    html: `<h2>${paid ? "Online payment received" : "New Cash-on-Delivery order"}</h2>
      <p><strong>Order:</strong> ${escapeHtml(n.orderNumber)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(n.customer.name)} (${escapeHtml(n.customer.email)}${n.customer.phone ? `, ${escapeHtml(n.customer.phone)}` : ""})</p>
      <p><strong>Amount:</strong> ${inr(n.total)} via ${escapeHtml(n.paymentMethod)}</p>
      <p><a href="${getAppUrl()}/admin">Open the owner dashboard</a></p>`,
  };
}

export const emailChannel: NotificationChannel = {
  name: "email",
  isConfigured: isEmailConfigured,
  async send(n) {
    const attachments = n.invoice ? [n.invoice] : undefined;
    const customer = buildCustomerEmail(n);
    const owner = buildOwnerEmail(n);
    const ownerEmail = process.env.ADMIN_EMAIL;

    const results = await Promise.allSettled([
      sendEmailOrThrow({ to: n.customer.email, ...customer, attachments }),
      ownerEmail ? sendEmailOrThrow({ to: ownerEmail, ...owner }) : Promise.resolve(),
    ]);

    // The customer email is what matters; report its failure. An owner-alert
    // failure is logged but doesn't mark the channel failed.
    if (results[1].status === "rejected") {
      console.error("[NOTIFY] Owner email failed:", results[1].reason);
    }
    if (results[0].status === "rejected") {
      throw results[0].reason;
    }
  },
};
