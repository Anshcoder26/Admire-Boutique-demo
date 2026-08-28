import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategorySection } from "@/components/category-section";
import { HeroSection } from "@/components/hero-section";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductGrid } from "@/components/product-grid";
import { InstagramFeed } from "@/components/instagram-feed";
import { reviews } from "@/data/products";
import { getCatalogProducts } from "@/lib/catalog-store";

export default async function HomePage() {
  const products = await getCatalogProducts();
  const newArrivals = products.slice(0, 3);
  const bestSellers = products.slice(3, 6);

  return (
    <main>
      <HeroSection />
      <CategorySection />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
          <div className="absolute left-[6%] top-[8%] h-[5.2rem] w-[5.2rem] text-[#5b2722]/40 animate-float-elegant" style={{ animationDelay: "0.2s" }}>
            <svg viewBox="0 0 64 64" className="h-full w-full fill-none stroke-current" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 18c5 6 5 12 0 18c-5-6-5-12 0-18Z" />
              <path d="M22 22c6 3 9 8 10 14c-7-1-12-4-16-10c2-3 3-4 6-4Z" />
              <path d="M42 22c-6 3-9 8-10 14c7-1 12-4 16-10c-2-3-3-4-6-4Z" />
              <path d="M16 33c7 0 12 2 16 6c-8 2-14 1-19-4c1-1 2-2 3-2Z" />
              <path d="M48 33c-7 0-12 2-16 6c8 2 14 1 19-4c-1-1-2-2-3-2Z" />
              <path d="M10 49c7-3 13-3 20 0" />
              <path d="M34 49c7-3 13-3 20 0" />
            </svg>
          </div>
          <div className="absolute right-[8%] top-[18%] h-[4.6rem] w-[4.6rem] text-[#6f3a2d]/35 animate-float-elegant" style={{ animationDelay: "1.2s" }}>
            <svg viewBox="0 0 64 64" className="h-full w-full fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 17c4 5 4 11 0 16c-4-5-4-11 0-16Z" />
              <path d="M24 22c5 3 7 7 8 12c-6-1-10-3-13-8c1-2 2-3 5-4Z" />
              <path d="M40 22c-5 3-7 7-8 12c6-1 10-3 13-8c-1-2-2-3-5-4Z" />
              <path d="M18 34c6 0 10 2 14 5c-7 2-12 1-16-3" />
              <path d="M46 34c-6 0-10 2-14 5c7 2 12 1 16-3" />
              <path d="M52 16l2 2m-2 0l2-2m-44 2l2 2m-2 0l2-2" />
            </svg>
          </div>
          <div className="absolute left-[10%] top-[34%] h-[5.4rem] w-[5.4rem] text-[#5b2722]/32 animate-float-elegant" style={{ animationDelay: "2.2s" }}>
            <svg viewBox="0 0 64 64" className="h-full w-full fill-none stroke-current" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 19c5 6 5 12 0 18c-5-6-5-12 0-18Z" />
              <path d="M22 23c6 3 9 8 10 14c-7-1-12-4-16-10c2-3 3-4 6-4Z" />
              <path d="M42 23c-6 3-9 8-10 14c7-1 12-4 16-10c-2-3-3-4-6-4Z" />
              <path d="M16 35c7 0 12 2 16 6c-8 2-14 1-19-4" />
              <path d="M48 35c-7 0-12 2-16 6c8 2 14 1 19-4" />
              <path d="M8 51c8-3 15-3 24 0M32 51c8-3 15-3 24 0" />
            </svg>
          </div>
          <div className="absolute right-[11%] top-[51%] h-[5rem] w-[5rem] text-[#744030]/38 animate-float-elegant" style={{ animationDelay: "0.7s" }}>
            <svg viewBox="0 0 64 64" className="h-full w-full fill-none stroke-current" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 17c4 5 4 11 0 16c-4-5-4-11 0-16Z" />
              <path d="M24 22c5 3 7 7 8 12c-6-1-10-3-13-8c1-2 2-3 5-4Z" />
              <path d="M40 22c-5 3-7 7-8 12c6-1 10-3 13-8c-1-2-2-3-5-4Z" />
              <path d="M18 34c6 0 10 2 14 5c-7 2-12 1-16-3" />
              <path d="M46 34c-6 0-10 2-14 5c7 2 12 1 16-3" />
              <path d="M28 45h8m-4-4v8" />
            </svg>
          </div>
          <div className="absolute left-[8%] top-[69%] h-[4.8rem] w-[4.8rem] text-[#5b2722]/34 animate-float-elegant" style={{ animationDelay: "1.9s" }}>
            <svg viewBox="0 0 64 64" className="h-full w-full fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 19c5 6 5 12 0 18c-5-6-5-12 0-18Z" />
              <path d="M22 23c6 3 9 8 10 14c-7-1-12-4-16-10c2-3 3-4 6-4Z" />
              <path d="M42 23c-6 3-9 8-10 14c7-1 12-4 16-10c-2-3-3-4-6-4Z" />
              <path d="M16 35c7 0 12 2 16 6c-8 2-14 1-19-4" />
              <path d="M48 35c-7 0-12 2-16 6c8 2 14 1 19-4" />
              <circle cx="13" cy="19" r="1.4" />
              <circle cx="50" cy="48" r="1.4" />
            </svg>
          </div>
          <div className="absolute right-[6%] top-[84%] h-[5.3rem] w-[5.3rem] text-[#6c342a]/40 animate-float-elegant" style={{ animationDelay: "2.5s" }}>
            <svg viewBox="0 0 64 64" className="h-full w-full fill-none stroke-current" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 18c5 6 5 12 0 18c-5-6-5-12 0-18Z" />
              <path d="M22 22c6 3 9 8 10 14c-7-1-12-4-16-10c2-3 3-4 6-4Z" />
              <path d="M42 22c-6 3-9 8-10 14c7-1 12-4 16-10c-2-3-3-4-6-4Z" />
              <path d="M16 33c7 0 12 2 16 6c-8 2-14 1-19-4" />
              <path d="M48 33c-7 0-12 2-16 6c8 2 14 1 19-4" />
              <path d="M12 17l2 2m-2 0l2-2m36 2l2 2m-2 0l2-2" />
            </svg>
          </div>
        </div>
        <div className="relative z-10">

      <section className="bg-gradient-to-b from-transparent via-[#f4ece6]/60 to-transparent px-4 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <LotusOrnament className="h-12 w-12 rounded-full border-2 border-[#7D1D1D]/30 bg-gradient-to-br from-[#7D1D1D]/10 to-[#D4AF37]/10 p-2.5 animate-pulse" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7D1D1D]">✨ Fresh Arrivals</p>
                <h2 className="bg-gradient-to-r from-[#7D1D1D] to-[#8B7355] bg-clip-text font-serif text-5xl font-bold text-transparent">New in Kurtis</h2>
              </div>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-base font-bold text-[#7D1D1D] transition-colors hover:text-[#8B7355]">
              View all <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#fff5f0] via-[#f7efe8] to-[#f0e7de] p-8 shadow-[0_20px_50px_rgba(125,29,29,0.1)] md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7D1D1D]">🌸 Featured Collection</p>
                <h2 className="bg-gradient-to-r from-[#7D1D1D] via-[#8B7355] to-[#D4AF37] bg-clip-text font-serif text-5xl font-bold leading-tight text-transparent lg:text-6xl">A softer way<br />to dress up.</h2>
              </div>
              <p className="max-w-lg text-lg leading-8 text-[#5c4f49]">
                Thoughtful silhouettes, artisan finishes and the warmth of Indian craftsmanship brought together in one collection.
              </p>
              <Link href="/products" className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#7D1D1D] to-[#8B7355] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#7D1D1D]/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95">
                Shop the Edit <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-[32px] shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Image src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" alt="Feature portfolio one" width={700} height={1000} className="h-[280px] w-full object-cover" priority loading="eager" />
              </div>
              <div className="overflow-hidden rounded-[32px] shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Image src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80" alt="Feature portfolio two" width={700} height={1000} className="h-[280px] w-full object-cover" loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-[#f4ece6]/50 to-transparent px-4 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <LotusOrnament className="h-12 w-12 rounded-full border-2 border-[#8B7355]/30 bg-gradient-to-br from-[#8B7355]/10 to-[#D4AF37]/10 p-2.5 animate-pulse" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8B7355]">⭐ Best Sellers</p>
                <h2 className="bg-gradient-to-r from-[#7D1D1D] to-[#8B7355] bg-clip-text font-serif text-5xl font-bold text-transparent">Loved by Everyone</h2>
              </div>
            </div>
          </div>
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[40px] border border-[#7D1D1D]/20 bg-gradient-to-br from-[#fff5f0] via-[#f7efe8] to-[#f4ece6] p-8 shadow-[0_20px_50px_rgba(125,29,29,0.1)] md:p-12">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7D1D1D]">💎 Why Choose Us</p>
            <h2 className="bg-gradient-to-r from-[#7D1D1D] to-[#8B7355] bg-clip-text font-serif text-5xl font-bold text-transparent lg:text-6xl">Designed for Confidence</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Premium Quality", text: "Soft-touch fabrics and considered finishes for a boutique feel.", icon: "✨" },
              { title: "Easy Shopping", text: "Mobile-first browsing, clear sizing and hassle-free delivery.", icon: "🛍️" },
              { title: "Trusted Service", text: "Responsive support and verified reviews from happy customers.", icon: "🤝" },
            ].map((feature) => (
              <div key={feature.title} className="group rounded-[28px] border border-[#7D1D1D]/10 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[#7D1D1D]/40 hover:shadow-2xl">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7D1D1D]/20 to-[#D4AF37]/20 text-2xl transition-all group-hover:from-[#7D1D1D]/40 group-hover:to-[#D4AF37]/40">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-serif text-2xl font-bold text-[#201614]">{feature.title}</h3>
                <p className="text-base leading-7 text-[#584942]">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-[#f4ece6]/60 to-transparent px-4 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <LotusOrnament className="h-12 w-12 rounded-full border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 p-2.5 animate-pulse" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8B7355]">💬 Customer Love</p>
                <h2 className="bg-gradient-to-r from-[#7D1D1D] to-[#D4AF37] bg-clip-text font-serif text-5xl font-bold text-transparent">Reviews That Feel Like Friends</h2>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.name} className="group rounded-[28px] bg-white/90 backdrop-blur-sm p-7 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50">
                <div className="mb-4 flex items-center gap-1 text-[#D4AF37] text-xl">
                  {"★".repeat(5)}
                </div>
                <h3 className="mb-3 font-serif text-xl font-bold text-[#201614]">{review.title}</h3>
                <p className="mb-6 text-base leading-8 text-[#584942] italic">&quot;{review.text}&quot;</p>
                <div className="pt-4 border-t border-[#D4AF37]/20">
                  <p className="bg-gradient-to-r from-[#7D1D1D] to-[#8B7355] bg-clip-text text-sm font-bold uppercase tracking-[0.2em] text-transparent">— {review.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[40px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#2b1b1b] via-[#1a1612] to-[#1f1814] p-10 text-white shadow-[0_25px_50px_rgba(125,29,29,0.2)]">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">📱 Follow Our Style</p>
              <h2 className="mt-3 bg-gradient-to-r from-[#7D1D1D] via-[#D4AF37] to-[#f7dca0] bg-clip-text font-serif text-5xl font-bold text-transparent lg:text-6xl">@admire_boutique.ab</h2>
            </div>
            <Link href="https://www.instagram.com/admire_boutique.ab/" target="_blank" className="rounded-full border-2 border-[#D4AF37] px-6 py-3 text-base font-bold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all hover:scale-105 hover:shadow-lg">Follow Us</Link>
          </div>
          <InstagramFeed />
        </div>
      </section>
        </div>
      </div>
    </main>
  );
}
