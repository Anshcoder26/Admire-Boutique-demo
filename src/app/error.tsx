"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logger } from "@/lib/logger";
import { captureException } from "@/lib/error-tracking";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("[APP] Unhandled route error:", error);
    void captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
        Something went wrong
      </p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-[#7D1D1D] sm:text-4xl">
        We hit a snag
      </h1>
      <p className="mt-4 max-w-md text-sm text-[#8B7355]">
        An unexpected error occurred while loading this page. Please try again — if
        the problem persists, come back in a little while.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-[#7D1D1D] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#8B7355]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#7D1D1D]/30 px-6 py-3 text-sm font-bold text-[#7D1D1D] transition-colors hover:border-[#7D1D1D]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
