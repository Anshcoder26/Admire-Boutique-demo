import { readCodPaymentDetails } from "@/lib/cod";
import { getCustomerById, getOrderById } from "@/lib/db";
import { getAppUrl, isEmailConfigured, sendEmailOrThrow } from "@/lib/email-service";
import { captureException } from "@/lib/error-tracking";
import {
  buildBodyTemplate,
  buildCodAdvanceRequestEmail,
  buildCodAdvanceVerifiedEmail,
  buildOwnerCodOrderEmail,
  codAdvanceRequestValues,
  codTemplateNames,
} from "@/lib/notifications/cod-messages";
import { sendOwnerOrderAlert } from "@/lib/notifications/owner-whatsapp-channel";
import { graphRequest, normalizeWhatsAppNumber, readConfig } from "@/lib/notifications/whatsapp-channel";

type Task = { label: string; run: () => Promise<void> };

async function loadOrderContext(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) return null;
  const customer = await getCustomerById(order.customer_id);
  if (!customer) return null;
  const address = (order.shipping_address ?? {}) as Record<string, string>;
  return {
    order,
    customer,
    address,
    // Same rule as payment receipts: the account phone is the customer's own number.
    phone: customer.phone || address.phone || "",
    advance: Number(order.cod_advance_amount),
    total: Number(order.total),
  };
}

async function sendCustomerTemplate(phone: string, orderNumber: string, templateName: string, values: string[]) {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) return;
  const config = readConfig();
  const to = normalizeWhatsAppNumber(phone, config.defaultCountryCode);
  if (!to) throw new Error(`No valid WhatsApp number for order ${orderNumber}`);
  await graphRequest(config, "messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildBodyTemplate(to, templateName, config, values)),
  });
}

/** Runs every task independently, so one failing never stops the others. Never throws. */
async function runAll(orderId: string, tasks: Task[]) {
  const results = await Promise.allSettled(tasks.map((task) => task.run()));
  results.forEach((result, index) => {
    if (result.status === "fulfilled") return;
    const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
    console.error(`[NOTIFY] ${tasks[index].label} failed for ${orderId}: ${message}`);
    void captureException(result.reason, { route: `notifications/cod/${tasks[index].label}`, orderId });
  });
}

/** Ask the customer for the advance and alert the owner about a new COD order. Never throws. */
export async function notifyCodOrderPlaced(orderId: string): Promise<void> {
  try {
    const context = await loadOrderContext(orderId);
    if (!context) {
      console.error(`[NOTIFY] COD order ${orderId} or its customer not found - nothing sent`);
      return;
    }
    const { order, customer, address, phone, advance, total } = context;
    const payment = readCodPaymentDetails();
    const ownerEmail = process.env.ADMIN_EMAIL;
    const items = (order.items as Array<{ name?: string; size?: string; qty?: number }>).map((item) => ({
      name: item.name ?? "",
      size: item.size,
      quantity: Number(item.qty ?? 0),
    }));

    const tasks: Task[] = [
      {
        label: "owner-whatsapp",
        run: () =>
          sendOwnerOrderAlert({
            orderNumber: order.order_number,
            customerName: customer.name,
            total,
            paymentMethod: order.payment_method,
          }),
      },
    ];

    // The template can't be sent with an empty UPI ID, so wait until it's configured.
    if (payment.upiId) {
      tasks.push({
        label: "customer-whatsapp",
        run: () =>
          sendCustomerTemplate(
            phone,
            order.order_number,
            codTemplateNames().advanceRequest,
            codAdvanceRequestValues(order.order_number, payment)
          ),
      });
    } else {
      console.warn(`[NOTIFY] COD_UPI_ID is not set - advance request not sent on WhatsApp for ${order.order_number}`);
    }

    if (isEmailConfigured()) {
      tasks.push({
        label: "customer-email",
        run: () =>
          sendEmailOrThrow({
            to: customer.email,
            ...buildCodAdvanceRequestEmail({
              customerName: customer.name,
              orderNumber: order.order_number,
              total,
              advance,
              payment,
            }),
          }),
      });
      if (ownerEmail) {
        tasks.push({
          label: "owner-email",
          run: () =>
            sendEmailOrThrow({
              to: ownerEmail,
              ...buildOwnerCodOrderEmail({
                orderNumber: order.order_number,
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: phone,
                total,
                advance,
                items,
                addressLine: [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(", "),
                dashboardUrl: `${getAppUrl()}/admin`,
              }),
            }),
        });
      }
    }

    await runAll(orderId, tasks);
  } catch (error) {
    console.error(`[NOTIFY] Failed to prepare COD order notifications for ${orderId}:`, error);
    void captureException(error, { route: "notifications/cod", orderId });
  }
}

/** Tell the customer their advance was verified and the order is confirmed. Never throws. */
export async function notifyCodAdvanceVerified(orderId: string): Promise<void> {
  try {
    const context = await loadOrderContext(orderId);
    if (!context) {
      console.error(`[NOTIFY] COD order ${orderId} or its customer not found - nothing sent`);
      return;
    }
    const { order, customer, phone, advance, total } = context;

    const tasks: Task[] = [
      {
        label: "customer-whatsapp",
        run: () => sendCustomerTemplate(phone, order.order_number, codTemplateNames().advanceVerified, [order.order_number]),
      },
    ];
    if (isEmailConfigured()) {
      tasks.push({
        label: "customer-email",
        run: () =>
          sendEmailOrThrow({
            to: customer.email,
            ...buildCodAdvanceVerifiedEmail({ customerName: customer.name, orderNumber: order.order_number, total, advance }),
          }),
      });
    }

    await runAll(orderId, tasks);
  } catch (error) {
    console.error(`[NOTIFY] Failed to prepare COD verified notifications for ${orderId}:`, error);
    void captureException(error, { route: "notifications/cod", orderId });
  }
}
