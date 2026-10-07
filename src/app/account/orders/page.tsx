"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { OrderStatusBadge, RetryPaymentButton, isAwaitingPayment } from "@/components/order-payment-status";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  payment_status: string;
  payment_method: string;
  delivery_partner: string;
  tracking_id: string;
  estimated_delivery: string;
  payment_expires_at?: string | null;
  items: Array<{ name: string; size: string; qty: number; price: number }>;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback(() => {
    fetch("/api/me/orders", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => { setOrders(data.orders || []); })
      .catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem("admire-user-token");
    if (!token) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, [router, loadOrders]);

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/account" className="inline-flex items-center gap-2 text-sm font-medium text-[#7D1D1D]">
          <ArrowLeft className="h-4 w-4" />
          Back to account
        </Link>
      </div>

      <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-5 shadow-[var(--shadow-sm)] md:p-6">
        <div className="mb-5 flex items-center gap-2 text-[#7D1D1D]">
          <PackageCheck className="h-4 w-4" />
          <h1 className="font-serif text-5xl font-semibold tracking-tight text-[var(--ink)]">Order history</h1>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--ink)]/15 bg-white p-5 text-sm text-[var(--ink)]/70">You have not placed any orders yet.</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-[var(--ink)]/10 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <Link href={`/orders/${order.id}`} className="font-medium text-[var(--ink)] hover:text-[#7D1D1D]">{order.order_number}</Link>
                    <div className="text-xs uppercase tracking-[0.14em] text-[var(--ink)]/50">{order.payment_method} · {order.payment_status}</div>
                  </div>
                  <OrderStatusBadge status={order.status} paymentStatus={order.payment_status} />
                </div>
                <div className="space-y-2 text-sm text-[var(--ink)]/70">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.name}`} className="flex items-center justify-between gap-3">
                      <span>{item.name} ({item.size}) × {item.qty}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                </div>
                {isAwaitingPayment(order.status) ? (
                  <div className="mt-4 border-t border-[var(--ink)]/10 pt-3">
                    <p className="mb-3 text-sm text-[var(--ink)]/70">
                      Payment for this order wasn&apos;t completed. Pay now to confirm it — unpaid orders are cancelled automatically.
                    </p>
                    <RetryPaymentButton orderId={order.id} expiresAt={order.payment_expires_at} onChange={loadOrders} />
                    <div className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink)]">Total: ₹{order.total}</div>
                  </div>
                ) : order.status === "Cancelled" ? (
                  <div className="mt-4 border-t border-[var(--ink)]/10 pt-3 text-xs uppercase tracking-[0.14em] text-[var(--ink)]/50">
                    {order.payment_status === "Refund Due" ? (
                      <div className="normal-case tracking-normal text-sm text-[#8a4b00]">
                        Your payment was received after this order was cancelled. The full amount will be refunded to your original payment method within 5–7 working days.
                      </div>
                    ) : null}
                    <div className="mt-2 font-medium text-[var(--ink)]">Total: ₹{order.total}</div>
                  </div>
                ) : (
                  <div className="mt-4 border-t border-[var(--ink)]/10 pt-3 text-xs uppercase tracking-[0.14em] text-[var(--ink)]/50">
                    <div>Delivery partner: {order.delivery_partner}</div>
                    <div>Tracking: {order.tracking_id}</div>
                    <div>ETA: {order.estimated_delivery}</div>
                    <div className="mt-2 font-medium text-[var(--ink)]">Total: ₹{order.total}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
