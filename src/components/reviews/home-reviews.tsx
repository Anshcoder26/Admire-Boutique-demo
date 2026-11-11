"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReviewCard } from "@/components/reviews/review-card";
import { useApprovedReviews } from "@/components/reviews/review-list";

const linkClass =
  "inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[#7D1D1D]/40 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#7D1D1D] hover:bg-[#7D1D1D]/5";

/** Latest approved customer reviews for the home page. */
export function HomeReviews() {
  const { loading, reviews } = useApprovedReviews(undefined, 3);

  if (loading) return <div className="min-h-[200px]" aria-hidden />;

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-[var(--ink)]/15 bg-white p-8 text-center">
        <p className="max-w-md text-[var(--ink)]/70">We&apos;re collecting reviews from our customers. Shopped with us? We&apos;d love to hear from you.</p>
        <Link href="/review" className={linkClass}>
          Be the first to review <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} showProduct />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/review" className={linkClass}>
          Read all reviews <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
