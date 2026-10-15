import { LotusOrnament } from "@/components/lotus-ornament";

const block = "rounded-lg bg-[#efe4dc] motion-safe:animate-pulse";

function LoadingLabel() {
  return <span className="sr-only">Loading…</span>;
}

/** Shown while any page loads: the lotus emblem gently pulsing. */
export function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <LotusOrnament className="h-14 w-14 rounded-full border border-[#7D1D1D]/20 bg-[#fff5f0] p-2.5 motion-safe:animate-pulse" />
      <p aria-hidden="true" className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]/70">
        Loading
      </p>
      <LoadingLabel />
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--ink)]/10 bg-white">
      <div className={`h-60 md:h-72 rounded-none ${block}`} />
      <div className="space-y-3 p-5">
        <div className={`h-3 w-24 ${block}`} />
        <div className={`h-5 w-3/4 ${block}`} />
        <div className={`h-5 w-20 ${block}`} />
      </div>
    </div>
  );
}

/** Shown while the shop page loads: heading and product card placeholders. */
export function ProductGridSkeleton() {
  return (
    <main role="status" aria-live="polite" className="px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <LotusOrnament className="h-10 w-10 md:h-11 md:w-11 rounded-full border border-[#7D1D1D]/25 bg-[#fff5f0] p-2 motion-safe:animate-pulse" />
          <div className="space-y-2">
            <div className={`h-3 w-24 ${block}`} />
            <div className={`h-8 w-56 md:h-10 md:w-80 ${block}`} />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <LoadingLabel />
    </main>
  );
}

/** Shown while a product page loads: photo, name, price and button placeholders. */
export function ProductDetailSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:px-8 lg:px-10">
      <div className={`mb-8 h-4 w-64 ${block}`} />
      <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-3">
          <div className={`h-[520px] md:h-[680px] xl:h-[760px] rounded-[30px] ${block}`} />
          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={`h-24 md:h-28 rounded-[18px] ${block}`} />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className={`h-3 w-28 ${block}`} />
          <div className={`h-9 w-4/5 ${block}`} />
          <div className={`h-7 w-32 ${block}`} />
          <div className={`h-24 w-full ${block}`} />
          <div className={`h-12 w-full ${block}`} />
        </div>
      </div>
      <LoadingLabel />
    </div>
  );
}
