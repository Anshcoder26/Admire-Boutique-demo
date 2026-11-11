import { BadgeCheck } from "lucide-react";

export type PublicReview = {
  id: string;
  name: string;
  productId: string | null;
  productName: string | null;
  rating: number;
  title: string;
  body: string;
  photos: string[];
  verifiedBuyer: boolean;
  reply: string | null;
  replyAt: string | null;
  createdAt: string;
};

export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`text-[#D4AF37] ${className}`} aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-[var(--ink)]/15">{"★".repeat(Math.max(0, 5 - rating))}</span>
    </span>
  );
}

export function ReviewCard({ review, showProduct = false }: { review: PublicReview; showProduct?: boolean }) {
  const date = new Date(review.createdAt);
  return (
    <article className="flex h-full flex-col rounded-lg border border-[var(--ink)]/10 bg-white p-6">
      <Stars rating={review.rating} className="mb-3 text-lg" />
      <h3 className="mb-2 font-serif text-xl font-semibold text-[var(--ink)]">{review.title}</h3>
      <p className="whitespace-pre-line text-sm leading-7 text-[var(--ink)]/75">{review.body}</p>
      {review.photos.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.photos.map((src, index) => (
            <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md border border-[var(--ink)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element -- photos come from our own API and vary in size */}
              <img src={src} alt={`Photo ${index + 1} from ${review.name}`} loading="lazy" className="h-20 w-20 object-cover" />
            </a>
          ))}
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--ink)]/10 pt-4 text-xs text-[var(--ink)]/60">
        <span className="font-semibold uppercase tracking-[0.15em] text-[#7D1D1D]">{review.name}</span>
        {review.verifiedBuyer ? (
          <span className="inline-flex items-center gap-1 text-[#1d6a3d]">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified buyer
          </span>
        ) : null}
        {!Number.isNaN(date.getTime()) ? <span>{date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span> : null}
      </div>
      {showProduct && review.productName ? <p className="mt-2 text-xs text-[var(--ink)]/50">Reviewed: {review.productName}</p> : null}
      {review.reply ? (
        <div className="mt-4 rounded-md border-l-2 border-[#7D1D1D] bg-[#fff8f5] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7D1D1D]">Response from Admire Boutique</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[var(--ink)]/75">{review.reply}</p>
        </div>
      ) : null}
    </article>
  );
}
