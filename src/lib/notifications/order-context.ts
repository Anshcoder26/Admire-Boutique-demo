import { getCustomerById, getOrderById, type CustomerRecord } from "@/lib/db";
import { generateInvoicePDF, type InvoiceData } from "@/lib/invoice-generator";
import type { OrderEvent, OrderNotification } from "@/lib/notifications/types";

type RawItem = { name?: string; size?: string; qty?: number; quantity?: number; price?: number };
type StoredOrder = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value as T) ?? fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Shared by the invoice download route and the notification attachments. */
export function buildInvoiceData(
  order: StoredOrder,
  customer: { name?: string; email: string; phone?: string }
): InvoiceData {
  const items = parseJson<RawItem[]>(order.items, []);
  const address = parseJson<Record<string, string>>(order.shipping_address, {});

  return {
    orderNumber: order.order_number,
    date: new Date(order.created_at).toLocaleDateString("en-IN"),
    customerName: customer.name || "Customer",
    customerEmail: customer.email,
    customerPhone: customer.phone || address.phone || "N/A",
    address: {
      line1: address.line1 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
    },
    items: items.map((item) => ({
      name: item.name ?? "",
      quantity: Number(item.qty ?? item.quantity ?? 0),
      price: Number(item.price ?? 0),
    })),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    discount: Number(order.discount || 0),
    total: Number(order.total),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    estimatedDelivery: order.estimated_delivery || "4-7 business days",
  };
}

/** Loads the order + customer from the DB and renders the PDF invoice. */
export async function buildOrderNotification(
  event: OrderEvent,
  orderId: string
): Promise<OrderNotification | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const customer: CustomerRecord | null = await getCustomerById(order.customer_id);
  if (!customer) return null;

  const address = parseJson<Record<string, string>>(order.shipping_address, {});
  const invoiceData = buildInvoiceData(order, customer);

  return {
    event,
    orderId: order.id,
    orderNumber: order.order_number,
    customer: {
      name: customer.name,
      email: customer.email,
      // The account phone is the customer's own number; the shipping phone may
      // belong to a gift recipient, so it's only a fallback.
      phone: customer.phone || address.phone || undefined,
    },
    items: parseJson<RawItem[]>(order.items, []).map((item) => ({
      name: item.name ?? "",
      size: item.size,
      quantity: Number(item.qty ?? item.quantity ?? 0),
      price: Number(item.price ?? 0),
    })),
    subtotal: invoiceData.subtotal,
    shipping: invoiceData.shipping,
    discount: invoiceData.discount,
    total: invoiceData.total,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    estimatedDelivery: order.estimated_delivery || undefined,
    invoice: {
      filename: `Invoice-${order.order_number}.pdf`,
      content: await generateInvoicePDF(invoiceData),
    },
  };
}
