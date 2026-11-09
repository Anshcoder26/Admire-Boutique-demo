"use client";

import { useEffect, useRef, useState } from "react";
import { BellRing, X } from "lucide-react";

const POLL_MS = 30_000;

type AlertOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  payment_method: string;
  total: number;
};

// Unpaid online attempts aren't real orders yet; they are announced once paid.
const isRealOrder = (order: AlertOrder) => order.status !== "Awaiting Payment" && order.status !== "Cancelled";

/** Pops up on the owner dashboard when a new order arrives, and stays until dismissed. */
export function AdminOrderAlerts({ onViewOrders }: { onViewOrders: () => void }) {
  const [alerts, setAlerts] = useState<AlertOrder[]>([]);
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch("/api/admin/orders", { credentials: "include", cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as { orders?: AlertOrder[] };
        const orders = (data.orders || []).filter(isRealOrder);

        // The first load only records what already exists.
        if (!seen.current) {
          seen.current = new Set(orders.map((order) => order.id));
          return;
        }

        const fresh = orders.filter((order) => !seen.current!.has(order.id));
        if (!fresh.length) return;
        fresh.forEach((order) => seen.current!.add(order.id));
        if (active) setAlerts((current) => [...fresh, ...current]);
      } catch {
        // Try again on the next poll.
      }
    };

    void poll();
    const timer = setInterval(() => void poll(), POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (!alerts.length) return null;

  const dismiss = (id: string) => setAlerts((current) => current.filter((order) => order.id !== id));

  return (
    <div className="fixed inset-x-4 top-24 z-[90] flex flex-col gap-2 sm:left-auto sm:w-96" role="status" aria-live="polite">
      {alerts.map((order) => (
        <div key={order.id} className="rounded-lg border border-[#7D1D1D]/25 bg-white p-4 shadow-[var(--shadow-lg)]">
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-[#7D1D1D]" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--ink)]">New order: {order.order_number}</p>
              <p className="mt-1 text-sm text-[var(--ink)]/70">
                {order.customer_name} · ₹{Number(order.total).toLocaleString("en-IN")} · {order.payment_method}
              </p>
              <button
                type="button"
                onClick={() => {
                  onViewOrders();
                  dismiss(order.id);
                }}
                className="mt-2 text-sm font-semibold text-[#7D1D1D] underline"
              >
                View orders
              </button>
            </div>
            <button
              type="button"
              onClick={() => dismiss(order.id)}
              className="rounded p-1 text-[var(--ink)]/60 hover:bg-[var(--ink)]/10"
              aria-label={`Dismiss alert for ${order.order_number}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
