"use client";

import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList, ReviewSummary, useApprovedReviews } from "@/components/reviews/review-list";

/** The /review page body: write a review of the boutique, then read everyone's reviews. */
export function StoreReviews() {
  const { loading, reviews, summary, reload } = useApprovedReviews(undefined, 100);

  return (
    <div className="space-y-12">
      <section className="mx-auto max-w-2xl">
        <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">Write a review</h2>
        <ReviewForm onPosted={reload} />
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink)]">What our customers say</h2>
          <ReviewSummary summary={summary} />
        </div>
        <ReviewList reviews={reviews} loading={loading} showProduct emptyText="No reviews yet. Be the first to share your experience!" />
      </section>
    </div>
  );
}
