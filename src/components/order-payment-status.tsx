"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { formatPaymentDeadline, payOrderWithRazorpay } from "@/lib/razorpay-client";

/** Customer-facing label + colours for an order, taking payment state into account. */
export function describeOrderStatus(status: string, paymentStatus?: string) {
  const s = (status || "").toLowerCase().replace(/_/g, " ");
  const p = (paymentStatus || "").toLowerCase();

  if (p === "refund due") return { label: "Refund in progress", className: "bg-[#fff4e5] text-[#8a4b00]" };
  if (s === "awaiting payment") return { label: "Awaiting payment", className: "bg-[#fff4e5] text-[#8a4b00]" };
  if (s === "cancelled" && p === "failed") {
    return { label: "Cancelled · payment not completed", className: "bg-[#fff0f0] text-[#b3261e]" };
  }
  if (s === "cancelled" || s === "refunded") return { label: status, className: "bg-[#fff0f0] text-[#b3261e]" };
  if (s === "shipped") return { label: status, className: "bg-[#eaf1fb] text-[#1d4f91]" };
  return { label: status, className: "bg-[#edf5ee] text-[#1d6a3d]" };
}

export function OrderStatusBadge({ status, paymentStatus }: { status: string; paymentStatus?: string }) {
  const { label, className } = describeOrderStatus(status, paymentStatus);
  return (
    <span className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${className}`}>{label}</span>
  );
}

export function isAwaitingPayment(status: string) {
  return (status || "").toLowerCase().replace(/_/g, " ") === "awaiting payment";
}

function useSecondsLeft(expiresAt?: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  if (!expiresAt) return null;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
}

/**
 * "Retry payment" for an order still awaiting payment. Pays the same order
 * (no duplicate is created) until its payment window closes.
 */
export function RetryPaymentButton({
  orderId,
  expiresAt,
  onChange,
}: {
  orderId: string;
  expiresAt?: string | null;
  /** Called after the order's state changed (paid, expired, refund due). */
  onChange?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const secondsLeft = useSecondsLeft(expiresAt);
  const windowClosed = secondsLeft === 0;

  const retry = async () => {
    setBusy(true);
    setMessage("");
    const result = await payOrderWithRazorpay(orderId, { onAttemptFailed: setMessage });
    setBusy(false);
    if (result.status === "paid") {
      router.push(`/order-confirmation?orderId=${orderId}`);
      return;
    }
    setMessage(result.message || "Payment not completed.");
    if (result.status !== "not_completed") onChange?.();
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={retry}
          disabled={busy || windowClosed}
          className="inline-flex items-center gap-2 rounded-md bg-[#7D1D1D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#651616] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Opening payment..." : "Retry payment"}
        </button>
        {secondsLeft !== null && (
          <span className="text-xs text-[var(--ink)]/60">
            {windowClosed
              ? "Payment window closed — this order will be cancelled."
              : `Items reserved until ${formatPaymentDeadline(expiresAt)} (${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")} left)`}
          </span>
        )}
      </div>
      {message ? <p className="text-sm text-[#b3261e]">{message}</p> : null}
    </div>
  );
}
