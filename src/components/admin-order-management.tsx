"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
}

const ORDER_STATUSES = ["Confirmed", "Packed", "Shipped", "Delivered"];
const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

export function OrderManagement({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ orderId, paymentStatus: newPaymentStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o
          )
        );
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-[var(--ink)]/60">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div className="p-6 text-center text-[var(--ink)]/60">No orders yet</div>;
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--ink)]/10 bg-white overflow-x-auto">
      <div className="inline-block min-w-full">
        <table className="w-full text-sm">
          <thead className="bg-[var(--panel-alt)] border-b border-[var(--ink)]/10">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-[var(--ink)]/70">Order #</th>
              <th className="px-6 py-3 text-left font-semibold text-[var(--ink)]/70">Date</th>
              <th className="px-6 py-3 text-left font-semibold text-[var(--ink)]/70">Total</th>
              <th className="px-6 py-3 text-left font-semibold text-[var(--ink)]/70">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-[var(--ink)]/70">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--ink)]/10 hover:bg-white">
                <td className="px-6 py-4 font-medium text-[var(--ink)]">{order.order_number}</td>
                <td className="px-6 py-4 text-[var(--ink)]/60">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-semibold text-[var(--ink)]">
                  ₹{Number(order.total).toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4">
                  <div className="relative inline-block">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="appearance-none rounded-md border border-[var(--ink)]/12 bg-white px-4 py-1.5 text-sm font-medium text-[var(--ink)]/70 outline-none focus:border-[#7D1D1D] disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-[var(--ink)]/60 pointer-events-none" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative inline-block">
                    <select
                      value={order.payment_status}
                      onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="appearance-none rounded-md border border-[var(--ink)]/12 bg-white px-4 py-1.5 text-sm font-medium text-[var(--ink)]/70 outline-none focus:border-[#7D1D1D] disabled:opacity-50"
                    >
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-[var(--ink)]/60 pointer-events-none" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
