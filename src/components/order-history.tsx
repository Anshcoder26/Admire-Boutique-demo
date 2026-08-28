"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LotusOrnament } from "@/components/lotus-ornament";
import { Package, ArrowRight } from "lucide-react";

type Order = {
  id: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: {
    name: string;
    image: string;
    quantity: number;
    price: number;
  }[];
};

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Fetch from API
    fetch("/api/me/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      })
      .catch(() => {
        // Fallback to demo data if API fails
        setOrders([
          {
            id: "ORD-001",
            date: "2024-12-20",
            total: 5999,
            status: "delivered",
            items: [
              {
                name: "Banarasi Silk Saree",
                image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=500&q=60",
                quantity: 1,
                price: 5999,
              },
            ],
          },
        ]);
      });
  }, []);

  if (!mounted) return null;

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 flex items-center gap-3">
        <LotusOrnament className="h-11 w-11 rounded-full border border-[#d7c1af] bg-white/80 p-2" />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Your orders</p>
          <h1 className="mt-1 font-serif text-4xl text-[#201614]">Order History</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[30px] border border-[#eadcd3] bg-[#fffaf6] p-8 text-center shadow-[0_14px_32px_rgba(84,58,45,0.05)]">
          <Package className="mx-auto mb-4 h-12 w-12 text-[#8a6f5f]/50" />
          <p className="mb-4 text-lg font-medium text-[#201614]">No orders yet.</p>
          <p className="mb-6 text-sm text-[#584942]">Start shopping to see your order history here.</p>
          <Link href="/products" className="inline-flex rounded-full bg-[#4b1f1d] px-5 py-3 text-sm font-medium text-white">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[28px] border border-[#eadcd3] bg-white p-5 shadow-[0_12px_26px_rgba(84,58,45,0.04)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <p className="text-sm font-medium text-[#584942]">Order ID</p>
                      <p className="text-lg font-semibold text-[#241915]">{order.id}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Date</p>
                      <p className="mt-1 font-medium text-[#241915]">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Items</p>
                      <p className="mt-1 font-medium text-[#241915]">{order.items.length}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Total</p>
                      <p className="mt-1 font-semibold text-[#241915]">₹{order.total}</p>
                    </div>
                    <div className="flex items-end">
                      <Link href={`/orders/${order.id}`} className="inline-flex items-center gap-2 rounded-full bg-[#f5e9e4] px-3 py-2 text-xs font-medium text-[#4b1f1d] transition hover:bg-[#eadcd3]">
                        View details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item thumbnails */}
              <div className="flex gap-2 border-t border-[#eadcd3] pt-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    {item.quantity > 1 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#241915]/40">
                        <span className="text-xs font-bold text-white">+{item.quantity}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
