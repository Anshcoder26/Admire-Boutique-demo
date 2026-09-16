"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { ArrowLeft, PackageCheck } from "lucide-react";

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
  items: Array<{ name: string; size: string; qty: number; price: number }>;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = window.localStorage.getItem("admire-user-token");
    if (!token) {
      router.push('/login');
      return;
    }

    fetch("/api/me/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { setOrders(data.orders || []); })
      .catch(() => setOrders([]));
  }, []);

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
                    <div className="font-medium text-[var(--ink)]">{order.order_number}</div>
                    <div className="text-xs uppercase tracking-[0.14em] text-[var(--ink)]/50">{order.payment_status}</div>
                  </div>
                  <span className="rounded-md bg-[#edf5ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1d6a3d]">{order.status}</span>
                </div>
                <div className="space-y-2 text-sm text-[var(--ink)]/70">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.name}`} className="flex items-center justify-between gap-3">
                      <span>{item.name} ({item.size}) × {item.qty}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-[var(--ink)]/10 pt-3 text-xs uppercase tracking-[0.14em] text-[var(--ink)]/50">
                  <div>Delivery partner: {order.delivery_partner}</div>
                  <div>Tracking: {order.tracking_id}</div>
                  <div>ETA: {order.estimated_delivery}</div>
                  <div className="mt-2 font-medium text-[var(--ink)]">Total: ₹{order.total}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
