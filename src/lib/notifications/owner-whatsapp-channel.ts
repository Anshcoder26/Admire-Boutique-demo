import { ORDER_WHATSAPP_NUMBER } from "@/lib/cod";
import { buildBodyTemplate, codTemplateNames, ownerAlertValues, type OrderAlertDetails } from "@/lib/notifications/cod-messages";
import type { NotificationChannel } from "@/lib/notifications/types";
import { graphRequest, normalizeWhatsAppNumber, readConfig } from "@/lib/notifications/whatsapp-channel";

function isOwnerWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/** Alert the owner's own WhatsApp about a new order. Throws on failure. */
export async function sendOwnerOrderAlert(alert: OrderAlertDetails): Promise<void> {
  if (!isOwnerWhatsAppConfigured()) return;
  const config = readConfig();
  const to = normalizeWhatsAppNumber(process.env.OWNER_WHATSAPP_NUMBER || ORDER_WHATSAPP_NUMBER, config.defaultCountryCode);
  if (!to) throw new Error("OWNER_WHATSAPP_NUMBER is not a valid number");

  await graphRequest(config, "messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildBodyTemplate(to, codTemplateNames().ownerNewOrder, config, ownerAlertValues(alert))),
  });
}

/** Tells the owner about an online order once its payment is verified. */
export const ownerWhatsappChannel: NotificationChannel = {
  name: "owner-whatsapp",
  isConfigured: isOwnerWhatsAppConfigured,
  async send(n) {
    await sendOwnerOrderAlert({
      orderNumber: n.orderNumber,
      customerName: n.customer.name,
      total: n.total,
      paymentMethod: n.paymentMethod,
    });
  },
};
