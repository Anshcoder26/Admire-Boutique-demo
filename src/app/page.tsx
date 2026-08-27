import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Quote } from "lucide-react";
import { CategorySection } from "@/components/category-section";
import { HeroSection } from "@/components/hero-section";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductGrid } from "@/components/product-grid";
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

      <section className="px-4 py-12 md:px-8 lg:px-10 bg-gradient-to-b from-transparent via-[#f5e6f0]/50 to-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <LotusOrnament className="h-12 w-12 rounded-full border-2 border-gradient-to-r from-[#d81e8f] to-[#6f2fbf] bg-gradient-to-br from-[#d81e8f]/10 to-[#6f2fbf]/10 p-2.5 animate-pulse" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#d81e8f]">✨ Fresh Arrivals</p>
                <h2 className="font-serif text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d81e8f] to-[#6f2fbf]">New in Kurtis</h2>
              </div>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-base font-bold text-[#d81e8f] hover:text-[#a81566] transition-colors">
              View all <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-gradient-to-br from-[#fff5f0] via-[#f0e8f5] to-[#e8f8f9] p-8 md:p-12 border border-[#f4a500]/20 shadow-[0_20px_50px_rgba(216,30,143,0.1)]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#d81e8f]">🌸 Featured Collection</p>
                <h2 className="font-serif text-5xl lg:text-6xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#d81e8f] via-[#6f2fbf] to-[#00a8cc]">A softer way<br />to dress up.</h2>
              </div>
              <p className="max-w-lg text-lg leading-8 text-[#5c4f49]">
                Thoughtful silhouettes, artisan finishes and the warmth of Indian craftsmanship brought together in one collection.
              </p>
              <Link href="/products" className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#d81e8f] to-[#a81566] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#d81e8f]/30 transition-all hover:shadow-xl hover:scale-105 active:scale-95">
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

      <section className="px-4 py-12 md:px-8 lg:px-10 bg-gradient-to-b from-transparent via-[#e8f8f9]/40 to-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <LotusOrnament className="h-12 w-12 rounded-full border-2 border-gradient-to-r from-[#6f2fbf] to-[#00a8cc] bg-gradient-to-br from-[#6f2fbf]/10 to-[#00a8cc]/10 p-2.5 animate-pulse" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#6f2fbf]">⭐ Best Sellers</p>
                <h2 className="font-serif text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6f2fbf] to-[#00a8cc]">Loved by Everyone</h2>
              </div>
            </div>
          </div>
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[40px] bg-gradient-to-br from-[#fff5f0] via-[#f5e6f0] to-[#f0e8f5] p-8 md:p-12 border border-[#d81e8f]/20 shadow-[0_20px_50px_rgba(111,47,191,0.1)]">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#d81e8f]">💎 Why Choose Us</p>
            <h2 className="font-serif text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d81e8f] to-[#6f2fbf]">Designed for Confidence</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Premium Quality", text: "Soft-touch fabrics and considered finishes for a boutique feel.", icon: "✨" },
              { title: "Easy Shopping", text: "Mobile-first browsing, clear sizing and hassle-free delivery.", icon: "🛍️" },
              { title: "Trusted Service", text: "Responsive support and verified reviews from happy customers.", icon: "🤝" },
            ].map((feature) => (
              <div key={feature.title} className="group rounded-[28px] bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#d81e8f]/10 hover:border-[#d81e8f]/40">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#d81e8f]/20 to-[#6f2fbf]/20 text-2xl group-hover:from-[#d81e8f]/40 group-hover:to-[#6f2fbf]/40 transition-all">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-serif text-2xl font-bold text-[#201614]">{feature.title}</h3>
                <p className="text-base leading-7 text-[#584942]">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-10 bg-gradient-to-b from-transparent via-[#f5e6f0]/50 to-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <LotusOrnament className="h-12 w-12 rounded-full border-2 border-gradient-to-r from-[#00a8cc] to-[#f4a500] bg-gradient-to-br from-[#00a8cc]/10 to-[#f4a500]/10 p-2.5 animate-pulse" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00a8cc]">💬 Customer Love</p>
                <h2 className="font-serif text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00a8cc] to-[#f4a500]">Reviews That Feel Like Friends</h2>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.name} className="group rounded-[28px] bg-white/90 backdrop-blur-sm p-7 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#f4a500]/20 hover:border-[#f4a500]/50">
                <div className="mb-4 flex items-center gap-1 text-[#f4a500] text-xl">
                  {"★".repeat(5)}
                </div>
                <h3 className="mb-3 font-serif text-xl font-bold text-[#201614]">{review.title}</h3>
                <p className="mb-6 text-base leading-8 text-[#584942] italic">"{review.text}"</p>
                <div className="pt-4 border-t border-[#f4a500]/20">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#d81e8f] to-[#6f2fbf]">— {review.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[40px] bg-gradient-to-br from-[#2f1d2f] via-[#1a1612] to-[#0d1a1f] p-10 text-white shadow-[0_25px_50px_rgba(216,30,143,0.2)] border border-[#f4a500]/20">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f4a500]">📱 Follow Our Style</p>
              <h2 className="mt-3 font-serif text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff4db8] via-[#f4a500] to-[#4dd9ff]">@admireboutique</h2>
            </div>
            <Link href="https://instagram.com/admireboutique" target="_blank" className="rounded-full border-2 border-[#f4a500] px-6 py-3 text-base font-bold text-[#f4a500] hover:bg-[#f4a500]/10 transition-all">Follow Us</Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
            ].map((image) => (
              <div key={image} className="group overflow-hidden rounded-[28px] shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Image src={image} alt="Instagram style feed" width={900} height={1100} className="h-64 w-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
