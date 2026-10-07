import { captureException } from "@/lib/error-tracking";
import { dispatchToChannels, type ChannelResult } from "@/lib/notifications/dispatcher";
import { buildOrderNotification } from "@/lib/notifications/order-context";
import type { OrderEvent } from "@/lib/notifications/types";

export { dispatchToChannels, type ChannelResult } from "@/lib/notifications/dispatcher";
export type { OrderEvent, OrderNotification, NotificationChannel } from "@/lib/notifications/types";

/** Loads the order, renders the invoice and notifies the customer + owner. Never throws. */
export async function notifyOrderEvent(event: OrderEvent, orderId: string): Promise<ChannelResult[]> {
  try {
    const notification = await buildOrderNotification(event, orderId);
    if (!notification) {
      console.error(`[NOTIFY] Order ${orderId} or its customer not found – nothing sent`);
      return [];
    }
    return await dispatchToChannels(notification);
  } catch (error) {
    console.error(`[NOTIFY] Failed to prepare ${event} notification for ${orderId}:`, error);
    void captureException(error, { route: "notifications", orderId });
    return [];
  }
}
