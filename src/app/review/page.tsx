import type { Metadata } from "next";
import { StoreReviews } from "@/components/reviews/store-reviews";

export const metadata: Metadata = {
  title: "Customer Reviews | Admire Boutique",
  description: "Read real reviews from Admire Boutique customers, or share your own experience with photos.",
};

export default function ReviewPage() {
  return (
    <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Customer love</p>
        <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight text-[var(--ink)]">Reviews</h1>
        <p className="mx-auto mt-3 max-w-xl text-[var(--ink)]/70">
          Shopped with us? Tell us how your suit looked, fitted and felt. Your review and photos help other shoppers choose.
        </p>
      </div>
      <StoreReviews />
    </main>
  );
}
