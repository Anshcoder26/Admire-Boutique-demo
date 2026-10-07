import type { NotificationChannel, OrderNotification } from "@/lib/notifications/types";

/**
 * WhatsApp notifications via Meta's WhatsApp Cloud API.
 *
 * Business-initiated WhatsApp messages must use a template pre-approved in
 * WhatsApp Manager. Both templates take the same three body variables:
 *   {{1}} customer name, {{2}} order number, {{3}} amount (e.g. "₹2,048")
 * and, when WHATSAPP_SEND_INVOICE is not "false", a DOCUMENT header that
 * carries the PDF invoice.
 */

const GRAPH_BASE = (process.env.WHATSAPP_API_BASE_URL || "https://graph.facebook.com").replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 10_000;

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  apiVersion: string;
  languageCode: string;
  defaultCountryCode: string;
  sendInvoice: boolean;
  templates: Record<OrderNotification["event"], string>;
}

function readConfig(): WhatsAppConfig {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    apiVersion: process.env.WHATSAPP_API_VERSION || "v25.0",
    languageCode: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
    defaultCountryCode: (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91").replace(/\D/g, ""),
    sendInvoice: process.env.WHATSAPP_SEND_INVOICE !== "false",
    templates: {
      order_placed: process.env.WHATSAPP_TEMPLATE_ORDER_PLACED || "order_confirmation",
      payment_received: process.env.WHATSAPP_TEMPLATE_PAYMENT_RECEIVED || "payment_receipt",
    },
  };
}

/**
 * Converts a stored phone number to the digits-only international format the
 * Cloud API expects (e.g. "98765 43210" -> "919876543210"). Returns null when
 * the number can't be interpreted.
 */
export function normalizeWhatsAppNumber(raw: string | undefined | null, defaultCountryCode = "91"): string | null {
  const trimmed = String(raw ?? "").trim();
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  const isInternational = trimmed.startsWith("+") || digits.startsWith("00");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (isInternational) {
    return digits.length >= 8 && digits.length <= 15 ? digits : null;
  }

  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) return `${defaultCountryCode}${digits}`;
  if (digits.length === defaultCountryCode.length + 10 && digits.startsWith(defaultCountryCode)) return digits;
  return null;
}

export function buildTemplateMessage(
  n: OrderNotification,
  to: string,
  config: Pick<WhatsAppConfig, "languageCode" | "templates">,
  invoiceMediaId?: string
) {
  const components: Array<Record<string, unknown>> = [];

  if (invoiceMediaId && n.invoice) {
    components.push({
      type: "header",
      parameters: [{ type: "document", document: { id: invoiceMediaId, filename: n.invoice.filename } }],
    });
  }

  components.push({
    type: "body",
    parameters: [
      { type: "text", text: n.customer.name || "Customer" },
      { type: "text", text: n.orderNumber },
      { type: "text", text: `₹${Number(n.total).toLocaleString("en-IN")}` },
    ],
  });

  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: config.templates[n.event],
      language: { code: config.languageCode },
      components,
    },
  };
}

async function graphRequest(config: WhatsAppConfig, path: string, init: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(`${GRAPH_BASE}/${config.apiVersion}/${config.phoneNumberId}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${config.accessToken}`, ...(init.headers || {}) },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown> & {
    error?: { message?: string; code?: number };
  };
  if (!response.ok || data.error) {
    const reason = data.error?.message || `HTTP ${response.status}`;
    throw new Error(`WhatsApp API ${path} failed: ${reason}${data.error?.code ? ` (code ${data.error.code})` : ""}`);
  }
  return data;
}

async function uploadInvoice(config: WhatsAppConfig, invoice: NonNullable<OrderNotification["invoice"]>): Promise<string> {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append("file", new Blob([new Uint8Array(invoice.content)], { type: "application/pdf" }), invoice.filename);

  const data = await graphRequest(config, "media", { method: "POST", body: form });
  if (typeof data.id !== "string") throw new Error("WhatsApp media upload returned no id");
  return data.id;
}

export const whatsappChannel: NotificationChannel = {
  name: "whatsapp",
  isConfigured() {
    return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  },
  async send(n) {
    const config = readConfig();
    const to = normalizeWhatsAppNumber(n.customer.phone, config.defaultCountryCode);
    if (!to) {
      throw new Error(`No valid WhatsApp number for order ${n.orderNumber}`);
    }

    const mediaId = config.sendInvoice && n.invoice ? await uploadInvoice(config, n.invoice) : undefined;
    await graphRequest(config, "messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildTemplateMessage(n, to, config, mediaId)),
    });
  },
};
