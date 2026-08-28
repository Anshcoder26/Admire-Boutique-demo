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
        <Link href="/account" className="inline-flex items-center gap-2 text-sm font-medium text-[#5d2a25]">
          <ArrowLeft className="h-4 w-4" />
          Back to account
        </Link>
      </div>

      <div className="rounded-[30px] border border-[#eadcce] bg-white p-5 shadow-[0_18px_36px_rgba(84,58,45,0.04)] md:p-6">
        <div className="mb-5 flex items-center gap-2 text-[#5d2a25]">
          <PackageCheck className="h-4 w-4" />
          <h1 className="font-serif text-5xl text-[#201614]">Order history</h1>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#d9c3b8] bg-[#fffaf7] p-5 text-sm text-[#5a4b45]">You have not placed any orders yet.</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-[24px] border border-[#efe3d9] bg-[#fffaf7] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-[#201614]">{order.order_number}</div>
                    <div className="text-xs uppercase tracking-[0.14em] text-[#7a645d]">{order.payment_status}</div>
                  </div>
                  <span className="rounded-full bg-[#edf5ee] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1d6a3d]">{order.status}</span>
                </div>
                <div className="space-y-2 text-sm text-[#4d3d39]">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.name}`} className="flex items-center justify-between gap-3">
                      <span>{item.name} ({item.size}) × {item.qty}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-[#f0e3da] pt-3 text-xs uppercase tracking-[0.14em] text-[#7a645d]">
                  <div>Delivery partner: {order.delivery_partner}</div>
                  <div>Tracking: {order.tracking_id}</div>
                  <div>ETA: {order.estimated_delivery}</div>
                  <div className="mt-2 font-medium text-[#4f3732]">Total: ₹{order.total}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
