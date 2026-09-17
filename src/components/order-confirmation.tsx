"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader, PackageCheck, Sparkles } from "lucide-react";

type OrderItem = { name: string; quantity: number; price: number };

type OrderDetail = {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  items: OrderItem[];
};

const formatINR = (value: number) => `\u20B9${Number(value || 0).toLocaleString("en-IN")}`;

export function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    orderId ? "loading" : "error"
  );
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/me/orders?id=${encodeURIComponent(orderId)}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Order not found");
        const data = (await res.json()) as { success?: boolean; order?: OrderDetail };
        if (!data.success || !data.order) throw new Error("Order not found");
        if (active) {
          setOrder(data.order);
          setStatus("ready");
        }
      } catch {
        if (active) setStatus("error");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  if (status === "loading") {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-20">
        <Loader className="h-8 w-8 animate-spin text-[#7D1D1D]" />
        <p className="text-[var(--ink)]/60">Loading your order&hellip;</p>
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 lg:px-10">
        <div className="rounded-xl border border-[#b3261e]/30 bg-[#fff0f0] p-6 text-center md:p-10">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#b3261e]" />
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#b3261e]">
            We couldn&apos;t load your order
          </h1>
          <p className="mt-3 text-[var(--ink)]/70">
            Your order may still have been placed. You can view it in your account.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/orders"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7D1D1D] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#641414]"
            >
              View my orders
            </Link>
            <Link
              href="/products"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#7D1D1D]/40 bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#7D1D1D] hover:bg-[#7D1D1D]/5"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const itemCount = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const paymentLabel =
    order.paymentStatus === "Paid"
      ? `${order.paymentMethod || "Online"} \u00B7 Paid`
      : order.paymentMethod === "Cash on Delivery"
        ? "Cash on Delivery"
        : `${order.paymentMethod || "Payment"} \u00B7 Pending`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 lg:px-10">
      <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-6 text-center shadow-[var(--shadow-sm)] md:p-10">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-md bg-[#edf7ef] text-[#1d6a3d]">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Order confirmed</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold tracking-tight text-[var(--ink)]">Thank you for shopping</h1>
        <p className="mt-4 text-base text-[var(--ink)]/70">
          Your order <span className="font-semibold text-[var(--ink)]">{order.orderNumber}</span> is placed successfully.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--background)] p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[#7D1D1D]"><PackageCheck className="h-4 w-4" /> Order summary</div>
            <p className="text-sm text-[var(--ink)]/70">{itemCount} item{itemCount === 1 ? "" : "s"} \u00B7 {formatINR(order.total)}</p>
          </div>
          <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--background)] p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[#7D1D1D]"><Sparkles className="h-4 w-4" /> Payment</div>
            <p className="text-sm text-[var(--ink)]/70">{paymentLabel}</p>
          </div>
          <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--background)] p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[#7D1D1D]"><PackageCheck className="h-4 w-4" /> ETA</div>
            <p className="text-sm text-[var(--ink)]/70">Estimated 4&ndash;7 days</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/products" className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7D1D1D] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#641414]">Continue shopping</Link>
          <Link href={`/orders/${order.id}`} className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#7D1D1D]/40 bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#7D1D1D] hover:bg-[#7D1D1D]/5">Track order</Link>
        </div>
      </div>
    </div>
  );
}
