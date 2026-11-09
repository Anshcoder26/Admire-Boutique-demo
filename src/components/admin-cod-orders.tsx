"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { COD_HOLD_HOURS } from "@/lib/cod";

type PendingCodOrder = {
  id: string;
  orderNumber: string;
  total: number;
  advance: number;
  balance: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ name: string; size?: string; qty?: number }>;
  address: { full_name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
  holdEndsAt: string | null;
  holdOver: boolean;
};

const inr = (value: number) => `₹${Number(value).toLocaleString("en-IN")}`;

/** COD orders waiting for the ₹500 advance, which the owner confirms or cancels by hand. */
export function CodOrdersPanel() {
  const toast = useToast();
  const [orders, setOrders] = useState<PendingCodOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [utrById, setUtrById] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cod-orders", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { orders?: PendingCodOrder[] };
        setOrders(data.orders || []);
      }
    } catch {
      toast.error("Unable to load COD orders.");
    } finally {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      await load();
    };
    void run();
  }, [load]);

  const act = async (orderId: string, action: "advance_received" | "cancel", successMessage: string) => {
    setBusyId(orderId);
    try {
      const res = await fetch("/api/admin/cod-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, action, utr: utrById[orderId] || "" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Unable to update this order.");
        return;
      }
      toast.success(successMessage);
      await load();
    } catch {
      toast.error("Unable to update this order.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl text-[var(--ink)]">COD orders awaiting advance</h3>
          <p className="text-sm text-[var(--ink)]/60">Stock is held until you confirm or cancel. Call the customer if the advance hasn&apos;t arrived after {COD_HOLD_HOURS} hours.</p>
        </div>
        <button type="button" onClick={() => void load()} className="shrink-0 rounded-md border border-[var(--ink)]/15 px-3 py-2 text-sm font-medium text-[var(--ink)]">
          Refresh
        </button>
      </div>

      {!loaded ? (
        <p className="text-sm text-[var(--ink)]/60">Loading COD orders…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--ink)]/15 p-4 text-sm text-[var(--ink)]/60">No COD orders are waiting for an advance.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-[var(--ink)]/10 bg-white p-4 text-sm text-[var(--ink)]/80">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[var(--ink)]">{order.orderNumber}</span>
                {order.holdOver ? (
                  <span className="rounded-md bg-[#ffe6e6] px-2.5 py-1 text-xs font-semibold text-[#8a1f1f]">{COD_HOLD_HOURS} hours passed · call or cancel</span>
                ) : order.holdEndsAt ? (
                  <span className="rounded-md bg-[#fff4e5] px-2.5 py-1 text-xs font-semibold text-[#8a4b00]">
                    Hold until {new Date(order.holdEndsAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  </span>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="font-medium text-[var(--ink)]">{order.customerName}</p>
                  <p>{order.customerPhone}</p>
                  <p className="break-all">{order.customerEmail}</p>
                </div>
                <div>
                  <p>{[order.address.line1, order.address.line2].filter(Boolean).join(", ")}</p>
                  <p>{[order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(", ")}</p>
                  {order.address.phone ? <p>Delivery phone: {order.address.phone}</p> : null}
                </div>
                <div>
                  {order.items.map((item, index) => (
                    <p key={`${order.id}-${index}`}>
                      {item.name}{item.size ? ` (${item.size})` : ""} × {item.qty ?? 1}
                    </p>
                  ))}
                  <p className="mt-1 font-medium text-[var(--ink)]">
                    Total {inr(order.total)} · Advance {inr(order.advance)} · Balance {inr(order.balance)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 border-t border-[var(--ink)]/10 pt-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={utrById[order.id] || ""}
                  onChange={(e) => setUtrById((current) => ({ ...current, [order.id]: e.target.value }))}
                  maxLength={80}
                  placeholder="UPI reference no. from the screenshot"
                  aria-label={`UPI reference number for ${order.orderNumber}`}
                  className="min-w-0 flex-1 rounded-md border border-[var(--ink)]/15 bg-white px-3 py-2 outline-none focus:border-[#7D1D1D]"
                />
                <button
                  type="button"
                  disabled={busyId === order.id || !(utrById[order.id] || "").trim()}
                  onClick={() => void act(order.id, "advance_received", `${order.orderNumber} confirmed.`)}
                  className="rounded-md bg-[#7D1D1D] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Advance received
                </button>
                <button
                  type="button"
                  disabled={busyId === order.id}
                  onClick={() => {
                    if (window.confirm(`Cancel ${order.orderNumber}? Its stock will be returned to the store.`)) {
                      void act(order.id, "cancel", `${order.orderNumber} cancelled and stock returned.`);
                    }
                  }}
                  className="rounded-md border border-[#8a1f1f]/30 bg-[#fff2f2] px-4 py-2 font-semibold text-[#8a1f1f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel order
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
