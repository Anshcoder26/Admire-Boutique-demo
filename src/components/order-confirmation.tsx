import Link from "next/link";
import { CheckCircle2, PackageCheck, Sparkles } from "lucide-react";
import { LotusOrnament } from "@/components/lotus-ornament";

export function OrderConfirmation() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 lg:px-10">
      <div className="rounded-[32px] border border-[#e8d7ca] bg-[#fffaf6] p-6 text-center shadow-[0_18px_36px_rgba(84,58,45,0.05)] md:p-10">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#edf7ef] text-[#1d6a3d]">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="mb-4 flex items-center justify-center gap-3">
          <LotusOrnament className="h-10 w-10 rounded-full border border-[#d7c1af] bg-white/80 p-1.5" />
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Order confirmed</p>
          <LotusOrnament className="h-10 w-10 rounded-full border border-[#d7c1af] bg-white/80 p-1.5" />
        </div>
        <h1 className="mt-3 font-serif text-5xl text-[#201614]">Thank you for shopping</h1>
        <p className="mt-4 text-base text-[#5f4e49]">Your order <span className="font-semibold text-[#2a1d1a]">#ADM-28491</span> is placed successfully.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-white p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[#6d4a41]"><PackageCheck className="h-4 w-4" /> Order summary</div>
            <p className="text-sm text-[#584942]">2 items · ₹3,498</p>
          </div>
          <div className="rounded-[24px] bg-white p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[#6d4a41]"><Sparkles className="h-4 w-4" /> Payment</div>
            <p className="text-sm text-[#584942]">UPI · Successful</p>
          </div>
          <div className="rounded-[24px] bg-white p-5 text-left">
            <div className="mb-2 flex items-center gap-2 text-[#6d4a41]"><PackageCheck className="h-4 w-4" /> ETA</div>
            <p className="text-sm text-[#584942]">Estimated 3-5 days</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/products" className="rounded-full bg-[#4b1f1d] px-6 py-3.5 text-sm font-medium text-white">Continue shopping</Link>
          <Link href="#" className="rounded-full border border-[#d5baa7] bg-white px-6 py-3.5 text-sm font-medium text-[#402320]">Track order</Link>
        </div>
      </div>
    </div>
  );
}
