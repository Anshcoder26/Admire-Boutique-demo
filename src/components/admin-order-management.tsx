"use client";

import { Fragment, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { ORDER_STATUSES, PAYMENT_STATUSES, SYSTEM_STATUSES } from "@/lib/order-status";

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  payment_method: string;
  cod_advance_utr?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: Array<{ name: string; size?: string; qty?: number }>;
  address: { full_name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
}

// Keep the order's current value selectable even if it isn't a standard option.
const withCurrent = (options: string[], current: string) =>
  current && !options.includes(current) ? [current, ...options] : options;

export function OrderManagement({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders/all", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          setTruncated(Boolean(data.truncated));
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
      {truncated ? <p className="px-6 pt-4 text-sm text-[var(--ink)]/60">Showing the latest {orders.length} orders.</p> : null}
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
              <Fragment key={order.id}>
              <tr className="hover:bg-white">
                <td className="px-6 py-4 font-medium text-[var(--ink)]">{order.order_number}</td>
                <td className="px-6 py-4 text-[var(--ink)]/60">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-semibold text-[var(--ink)]">
                  ₹{Number(order.total).toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4">
                  {SYSTEM_STATUSES.includes(order.status) ? (
                    <span
                      title={
                        order.status === "Awaiting Payment"
                          ? "Online payment not completed yet. Do not pack or ship; it is cancelled automatically if unpaid."
                          : order.status === "Awaiting COD Advance"
                            ? "Waiting for the ₹500 advance. Do not pack or ship; confirm or cancel it above."
                            : "Cancelled (stock already returned)."
                      }
                      className={`inline-block rounded-md px-3 py-1.5 text-xs font-semibold ${
                        order.status === "Cancelled" ? "bg-[#ffe6e6] text-[#8a1f1f]" : "bg-[#fff4e5] text-[#8a4b00]"
                      }`}
                    >
                      {order.status === "Awaiting Payment"
                        ? "Awaiting payment · don't ship"
                        : order.status === "Awaiting COD Advance"
                          ? "Awaiting advance · don't ship"
                          : order.status}
                    </span>
                  ) : (
                  <div className="relative inline-block">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="appearance-none rounded-md border border-[var(--ink)]/12 bg-white px-4 py-1.5 text-sm font-medium text-[var(--ink)]/70 outline-none focus:border-[#7D1D1D] disabled:opacity-50"
                    >
                      {withCurrent(ORDER_STATUSES, order.status).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-[var(--ink)]/60 pointer-events-none" />
                  </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="relative inline-block">
                    <select
                      value={order.payment_status}
                      onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="appearance-none rounded-md border border-[var(--ink)]/12 bg-white px-4 py-1.5 text-sm font-medium text-[var(--ink)]/70 outline-none focus:border-[#7D1D1D] disabled:opacity-50"
                    >
                      {withCurrent(PAYMENT_STATUSES, order.payment_status).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-[var(--ink)]/60 pointer-events-none" />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-[var(--ink)]/10">
                <td colSpan={5} className="px-6 pb-4">
                  <div className="grid gap-3 rounded-md bg-[var(--panel-alt)] p-3 text-[var(--ink)]/80 sm:grid-cols-3">
                    <div>
                      <p className="font-medium text-[var(--ink)]">{order.customer_name}</p>
                      <p>{order.customer_phone}</p>
                      <p className="break-all">{order.customer_email}</p>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--ink)]">Ship to{order.address.full_name ? `: ${order.address.full_name}` : ""}</p>
                      <p>{[order.address.line1, order.address.line2].filter(Boolean).join(", ")}</p>
                      <p>{[order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(", ")}</p>
                      {order.address.phone ? <p>Phone: {order.address.phone}</p> : null}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--ink)]">{order.payment_method}</p>
                      {order.items.map((item, index) => (
                        <p key={`${order.id}-${index}`}>
                          {item.name}{item.size ? ` (${item.size})` : ""} × {item.qty ?? 1}
                        </p>
                      ))}
                      {order.cod_advance_utr ? <p>UPI reference: {order.cod_advance_utr}</p> : null}
                    </div>
                  </div>
                </td>
              </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
