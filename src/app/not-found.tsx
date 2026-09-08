import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-6xl font-bold text-[#D4AF37]">404</p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-[#7D1D1D] sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-sm text-[#8B7355]">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Explore our latest collection instead.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#7D1D1D] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#8B7355]"
        >
          Back to home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full border border-[#7D1D1D]/30 px-6 py-3 text-sm font-bold text-[#7D1D1D] transition-colors hover:border-[#7D1D1D]"
        >
          Shop collection
        </Link>
      </div>
    </div>
  );
}
