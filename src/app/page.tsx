import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, ShoppingBag, ShieldCheck } from "lucide-react";
import { CategorySection } from "@/components/category-section";
import { HeroSection } from "@/components/hero-section";
import { FabricBooti } from "@/components/motifs/fabric-booti";
import { LotusOrnament } from "@/components/lotus-ornament";
import { ProductGrid } from "@/components/product-grid";
import { InstagramFeed } from "@/components/instagram-feed";
import { SectionDivider } from "@/components/ui/section-divider";
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
        <div className="relative z-10">

      <section className="bg-gradient-to-b from-transparent via-[#f4ece6]/60 to-transparent px-4 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <LotusOrnament className="h-12 w-12 rounded-full border-2 border-[#7D1D1D]/30 bg-gradient-to-br from-[#7D1D1D]/10 to-[#D4AF37]/10 p-2.5" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7D1D1D]">Fresh Arrivals</p>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#7D1D1D]">New in Kurtis</h2>
              </div>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-base font-bold text-[#7D1D1D] transition-colors hover:text-[#8B7355]">
              View all <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <SectionDivider className="mb-4" />

      <section className="px-4 py-12 md:px-8 lg:px-10">
        <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#fff5f0] via-[#f7efe8] to-[#f0e7de] p-8 shadow-[0_20px_50px_rgba(125,29,29,0.1)] md:p-12">
          <FabricBooti opacity={0.045} size={140} motif="lotus" className="-z-10" />
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7D1D1D]">Featured Collection</p>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[#7D1D1D] lg:text-6xl">A softer way<br />to dress up.</h2>
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

      <SectionDivider className="mb-4" />

      <section className="bg-gradient-to-b from-transparent via-[#f4ece6]/50 to-transparent px-4 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <LotusOrnament className="h-12 w-12 rounded-full border-2 border-[#8B7355]/30 bg-gradient-to-br from-[#8B7355]/10 to-[#D4AF37]/10 p-2.5" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8B7355]">Best Sellers</p>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#7D1D1D]">Loved by Everyone</h2>
              </div>
            </div>
          </div>
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 lg:px-10">
        <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-[#7D1D1D]/20 bg-gradient-to-br from-[#fff5f0] via-[#f7efe8] to-[#f4ece6] p-8 shadow-[0_20px_50px_rgba(125,29,29,0.1)] md:p-12">
          <FabricBooti opacity={0.045} size={140} motif="lotus" className="-z-10" />
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7D1D1D]">Why Choose Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#7D1D1D] lg:text-6xl">Designed for Confidence</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Premium Quality", text: "Soft-touch fabrics and considered finishes for a boutique feel.", Icon: Gem },
              { title: "Easy Shopping", text: "Mobile-first browsing, clear sizing and hassle-free delivery.", Icon: ShoppingBag },
              { title: "Trusted Service", text: "Responsive support and verified reviews from happy customers.", Icon: ShieldCheck },
            ].map((feature) => (
              <div key={feature.title} className="group rounded-[28px] border border-[#7D1D1D]/10 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-[#7D1D1D]/40 hover:shadow-2xl">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7D1D1D]/8 text-[#7D1D1D] transition-colors group-hover:bg-[#7D1D1D]/15">
                  <feature.Icon className="h-6 w-6" strokeWidth={1.5} />
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
              <LotusOrnament className="h-12 w-12 rounded-full border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 p-2.5" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8B7355]">Customer Love</p>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#7D1D1D]">Reviews That Feel Like Friends</h2>
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
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#7D1D1D]">— {review.name}</p>
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
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Follow Our Style</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#D4AF37] lg:text-6xl">@admire_boutique.ab</h2>
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
