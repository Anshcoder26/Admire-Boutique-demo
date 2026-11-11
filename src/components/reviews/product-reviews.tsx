"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList, ReviewSummary, type useApprovedReviews } from "@/components/reviews/review-list";

/** Customer reviews of one product, with a form to add one. Shown on the product page. */
export function ProductReviews({
  productId,
  productName,
  state,
}: {
  productId: string;
  productName: string;
  state: ReturnType<typeof useApprovedReviews>;
}) {
  const { loading, reviews, summary } = state;
  const [writing, setWriting] = useState(false);

  return (
    <section id="reviews" className="mt-16 border-t border-[var(--ink)]/10 pt-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Customer reviews</p>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">What shoppers say</h2>
          <div className="mt-2">
            <ReviewSummary summary={summary} />
          </div>
        </div>
        {!writing ? (
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[#7D1D1D]/40 bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#7D1D1D] hover:bg-[#7D1D1D]/5"
          >
            <PenLine className="h-4 w-4" /> Write a review
          </button>
        ) : null}
      </div>

      {writing ? (
        <div className="mb-8 max-w-2xl">
          <ReviewForm productId={productId} productName={productName} onPosted={state.reload} />
        </div>
      ) : null}

      <ReviewList reviews={reviews} loading={loading} emptyText="No reviews yet. Bought this suit? Be the first to share how you liked it." />
    </section>
  );
}
