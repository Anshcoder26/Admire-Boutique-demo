/**
 * "payment_received" – an online (Razorpay) payment was verified. Orders are
 * only announced then, so abandoned payments send nothing.
 */
export type OrderEvent = "payment_received";

export interface OrderNotification {
  event: OrderEvent;
  orderId: string;
  orderNumber: string;
  customer: { name: string; email: string; phone?: string };
  items: Array<{ name: string; size?: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDelivery?: string;
  invoice?: { filename: string; content: Buffer };
}

export interface NotificationChannel {
  name: string;
  /** False when the channel's credentials aren't set; it is then skipped. */
  isConfigured(): boolean;
  /** Throws on failure; the dispatcher catches and logs. */
  send(notification: OrderNotification): Promise<void>;
}
