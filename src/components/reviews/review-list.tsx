"use client";

import { useEffect, useState } from "react";
import { ReviewCard, Stars, type PublicReview } from "@/components/reviews/review-card";

type Summary = { count: number; average: number };

/** Loads approved reviews (optionally for one product) from /api/reviews. */
export function useApprovedReviews(productId?: string, limit = 50) {
  const [state, setState] = useState<{ loading: boolean; reviews: PublicReview[]; summary: Summary }>({
    loading: true,
    reviews: [],
    summary: { count: 0, average: 0 },
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ limit: String(limit) });
    if (productId) query.set("productId", productId);
    fetch(`/api/reviews?${query}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { reviews?: PublicReview[]; summary?: Summary } | null) => {
        if (!active) return;
        setState({ loading: false, reviews: data?.reviews ?? [], summary: data?.summary ?? { count: 0, average: 0 } });
      })
      .catch(() => active && setState((prev) => ({ ...prev, loading: false })));
    return () => {
      active = false;
    };
  }, [productId, limit, version]);

  /** Fetch again, e.g. after the customer posts a review. */
  const reload = () => setVersion((v) => v + 1);
  return { ...state, reload };
}

export function ReviewSummary({ summary }: { summary: Summary }) {
  if (!summary.count) return null;
  return (
    <p className="flex items-center gap-2 text-sm text-[var(--ink)]/70">
      <Stars rating={Math.round(summary.average)} className="text-base" />
      <span className="font-semibold text-[var(--ink)]">{summary.average.toFixed(1)}</span> out of 5 · {summary.count} review{summary.count === 1 ? "" : "s"}
    </p>
  );
}

export function ReviewList({
  reviews,
  loading,
  emptyText,
  showProduct = false,
}: {
  reviews: PublicReview[];
  loading: boolean;
  emptyText: string;
  showProduct?: boolean;
}) {
  if (loading) return <p className="text-sm text-[var(--ink)]/50">Loading reviews…</p>;
  if (reviews.length === 0) {
    return <p className="rounded-lg border border-dashed border-[var(--ink)]/15 p-5 text-sm text-[var(--ink)]/60">{emptyText}</p>;
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} showProduct={showProduct} />
      ))}
    </div>
  );
}
