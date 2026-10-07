import {
  cancelUnpaidOrder,
  getOrderById,
  getCustomerById,
  listAwaitingPaymentOrderIds,
  listExpiredUnpaidOrderIds,
  recordOrderPayment,
  type PaymentRecordOutcome,
} from "@/lib/db";
import { getPaymentWindowMinutes } from "@/lib/payment-utils";
import { notifyOrderEvent } from "@/lib/notifications";
import { escapeHtml } from "@/lib/notifications/email-channel";
import { getAppUrl, isEmailConfigured, sendEmail } from "@/lib/email-service";
import { captureException } from "@/lib/error-tracking";

let lastSweepAt = 0;

/**
 * Cancel unpaid online orders whose payment window has passed and release
 * their stock. Throttled (at most once a minute, or once per window if
 * shorter) so it can be called cheaply from busy routes. Never throws.
 */
export async function sweepExpiredOrders(options: { force?: boolean } = {}): Promise<number> {
  const windowMinutes = getPaymentWindowMinutes();
  const throttleMs = Math.min(60_000, windowMinutes * 60_000);
  const now = Date.now();
  if (!options.force && now - lastSweepAt < throttleMs) return 0;
  lastSweepAt = now;

  try {
    const ids = await listExpiredUnpaidOrderIds(new Date(now), windowMinutes);
    let cancelled = 0;
    for (const id of ids) {
      if (await cancelUnpaidOrder(id)) cancelled++;
    }
    if (cancelled) console.info(`[PAYMENTS] Auto-cancelled ${cancelled} unpaid order(s); stock released`);
    return cancelled;
  } catch (error) {
    console.error("[PAYMENTS] Expiry sweep failed:", error);
    void captureException(error, { area: "payments.sweep" });
    return 0;
  }
}

/** Cancel a customer's other unpaid online orders (so retries don't pile up). */
export async function cancelAwaitingOrdersForCustomer(customerId: string, exceptOrderId?: string): Promise<number> {
  let cancelled = 0;
  for (const id of await listAwaitingPaymentOrderIds(customerId)) {
    if (id !== exceptOrderId && (await cancelUnpaidOrder(id))) cancelled++;
  }
  return cancelled;
}

/**
 * Record a verified payment (from the checkout callback or the webhook) and
 * return what happened. Exactly one caller per payment gets a non
 * "already_processed" outcome; pass it to `notifyPaymentOutcome`.
 */
export async function markOrderPaid(
  orderId: string,
  payment: { razorpayOrderId: string; razorpayPaymentId: string },
  source: "checkout" | "webhook"
): Promise<PaymentRecordOutcome> {
  const outcome = await recordOrderPayment(orderId, payment);
  if (outcome !== "already_processed") {
    console.info(`[PAYMENTS] ${source}: order ${orderId} -> ${outcome}`);
  }
  return outcome;
}

async function sendRefundDueEmails(orderId: string): Promise<void> {
  if (!isEmailConfigured()) return;
  const order = await getOrderById(orderId);
  if (!order) return;
  const customer = await getCustomerById(order.customer_id);
  const orderNumber = escapeHtml(String(order.order_number));
  const amount = `₹${Number(order.total).toLocaleString("en-IN")}`;
  const ownerEmail = process.env.ADMIN_EMAIL;

  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `Action needed: refund ${amount} for order ${order.order_number}`,
      html: `<p>A payment of <strong>${amount}</strong> for order <strong>${orderNumber}</strong> arrived after the order had been auto-cancelled, and the items are no longer in stock.</p>
<p>Razorpay payment id: <code>${escapeHtml(String(order.razorpay_payment_id ?? ""))}</code></p>
<p>Please refund it from the Razorpay dashboard (or contact the customer to offer an alternative), then set the order's payment status to <em>Refunded</em> in the owner dashboard.</p>`,
    });
  }
  if (customer?.email) {
    await sendEmail({
      to: customer.email,
      subject: `About your payment for order ${order.order_number}`,
      html: `<p>Hi ${escapeHtml(customer.name || "there")},</p>
<p>We received your payment of <strong>${amount}</strong> for order <strong>${orderNumber}</strong>, but it arrived after the order's payment window had closed and the items have since sold out.</p>
<p>We're sorry about this. Your payment will be refunded in full to the original payment method, usually within 5–7 business days. Questions? <a href="${getAppUrl()}/support">Contact us</a>.</p>
<p>— Admire Boutique</p>`,
    });
  }
}

/** Send the right messages for a payment outcome. Never throws. */
export async function notifyPaymentOutcome(outcome: PaymentRecordOutcome, orderId: string): Promise<void> {
  try {
    if (outcome === "paid" || outcome === "late_paid") {
      await notifyOrderEvent("payment_received", orderId);
    } else if (outcome === "refund_due") {
      await sendRefundDueEmails(orderId);
    }
  } catch (error) {
    console.error("[PAYMENTS] Notification after payment failed:", error);
    void captureException(error, { area: "payments.notify", orderId });
  }
}
