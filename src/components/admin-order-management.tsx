"use client";

import { useState, useEffect } from "react";
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

const STATUS_FILTERS = ["All", "Awaiting COD Advance", "Awaiting Payment", ...ORDER_STATUSES, "Cancelled"];

const searchableText = (order: Order) =>
  [
    order.order_number,
    order.customer_name,
    order.customer_phone,
    order.customer_email,
    order.cod_advance_utr,
    ...Object.values(order.address),
    ...order.items.map((item) => item.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const selectClass =
  "appearance-none rounded-md border border-[var(--ink)]/12 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-[var(--ink)]/70 outline-none focus:border-[#7D1D1D] disabled:opacity-50";

export function OrderManagement({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
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

  const query = search.trim().toLowerCase();
  const countFor = (status: string) => (status === "All" ? orders.length : orders.filter((o) => o.status === status).length);
  const visibleOrders = orders.filter(
    (order) => (statusFilter === "All" || order.status === statusFilter) && (!query || searchableText(order).includes(query))
  );

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search order, customer, phone, city or item"
        aria-label="Search orders"
        className="w-full rounded-md border border-[var(--ink)]/15 bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]"
      />
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={statusFilter === status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === status ? "border-[#7D1D1D] bg-[#7D1D1D] text-white" : "border-[var(--ink)]/15 bg-white text-[var(--ink)]/70"
            }`}
          >
            {status} ({countFor(status)})
          </button>
        ))}
      </div>
      {truncated ? <p className="text-sm text-[var(--ink)]/60">Showing the latest {orders.length} orders.</p> : null}

      {visibleOrders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--ink)]/15 p-4 text-sm text-[var(--ink)]/60">No orders match this search.</p>
      ) : null}

      {visibleOrders.map((order) => (
        <article key={order.id} className="rounded-lg border border-[var(--ink)]/10 bg-white p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="break-all font-semibold text-[var(--ink)]">{order.order_number}</p>
              <p className="text-xs text-[var(--ink)]/60">
                {new Date(order.created_at).toLocaleDateString()} · <span className="font-semibold text-[var(--ink)]">₹{Number(order.total).toLocaleString("en-IN")}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                    aria-label={`Status for ${order.order_number}`}
                    className={selectClass}
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
              <div className="relative inline-block">
                <select
                  value={order.payment_status}
                  onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                  disabled={updatingId === order.id}
                  aria-label={`Payment status for ${order.order_number}`}
                  className={selectClass}
                >
                  {withCurrent(PAYMENT_STATUSES, order.payment_status).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-[var(--ink)]/60 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 rounded-md bg-[var(--panel-alt)] p-3 text-[var(--ink)]/80 sm:grid-cols-3">
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
        </article>
      ))}
    </div>
  );
}
