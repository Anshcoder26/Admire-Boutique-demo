import Link from "next/link";
import { CheckCircle2, PackageCheck, Sparkles } from "lucide-react";

export function OrderConfirmation() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 lg:px-10">
      <div className="rounded-xl border border-[var(--ink)]/10 bg-white p-6 text-center shadow-[var(--shadow-sm)] md:p-10">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-md bg-[#edf7ef] text-[#1d6a3d]">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Order confirmed</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold tracking-tight text-[var(--ink)]">Thank you for shopping</h1>
        <p className="mt-4 text-base text-[var(--ink)]/70">Your order <span className="font-semibold text-[var(--ink)]">#ADM-28491</span> is placed successfully.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--background)] p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[#7D1D1D]"><PackageCheck className="h-4 w-4" /> Order summary</div>
            <p className="text-sm text-[var(--ink)]/70">2 items · ₹3,498</p>
          </div>
          <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--background)] p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[#7D1D1D]"><Sparkles className="h-4 w-4" /> Payment</div>
            <p className="text-sm text-[var(--ink)]/70">UPI · Successful</p>
          </div>
          <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--background)] p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[#7D1D1D]"><PackageCheck className="h-4 w-4" /> ETA</div>
            <p className="text-sm text-[var(--ink)]/70">Estimated 3-5 days</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/products" className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7D1D1D] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#641414]">Continue shopping</Link>
          <Link href="#" className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#7D1D1D]/40 bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#7D1D1D] hover:bg-[#7D1D1D]/5">Track order</Link>
        </div>
      </div>
    </div>
  );
}
