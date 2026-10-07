import { captureException } from "@/lib/error-tracking";
import { emailChannel } from "@/lib/notifications/email-channel";
import type { NotificationChannel, OrderNotification } from "@/lib/notifications/types";
import { whatsappChannel } from "@/lib/notifications/whatsapp-channel";

const defaultChannels: NotificationChannel[] = [emailChannel, whatsappChannel];

export type ChannelResult = { channel: string; status: "sent" | "skipped" | "failed"; error?: string };

/**
 * Sends a notification through every channel in parallel. Channels are
 * independent: one failing (or being unconfigured) never stops the others.
 * Never throws.
 */
export async function dispatchToChannels(
  notification: OrderNotification,
  channels: NotificationChannel[] = defaultChannels
): Promise<ChannelResult[]> {
  return Promise.all(
    channels.map(async (channel): Promise<ChannelResult> => {
      if (!channel.isConfigured()) {
        console.info(`[NOTIFY] ${channel.name} not configured – skipped ${notification.event} for ${notification.orderNumber}`);
        return { channel: channel.name, status: "skipped" };
      }
      try {
        await channel.send(notification);
        console.info(`[NOTIFY] ${channel.name} sent ${notification.event} for ${notification.orderNumber}`);
        return { channel: channel.name, status: "sent" };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[NOTIFY] ${channel.name} failed for ${notification.orderNumber}: ${message}`);
        void captureException(error, { route: `notifications/${channel.name}`, orderNumber: notification.orderNumber });
        return { channel: channel.name, status: "failed", error: message };
      }
    })
  );
}
