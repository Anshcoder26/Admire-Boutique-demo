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

      <section className="px-4 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <LotusOrnament className="h-9 w-9 rounded-full border border-[#d7c1af] bg-white/80 p-1.5" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Fresh arrivals</p>
                <h2 className="font-serif text-4xl text-[#201614]">New in kurtis</h2>
              </div>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-[#5d2a25]">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#f3e7db] p-4 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#7d645a]">Featured collection</p>
              <h2 className="font-serif text-5xl leading-none text-[#231711]">A softer way to dress up.</h2>
              <p className="max-w-lg text-base leading-7 text-[#5c4f49]">
                Thoughtful silhouettes, artisan finishes and the warmth of Indian craftsmanship brought together in one collection.
              </p>
              <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-[#4b1f1d] px-6 py-3.5 text-sm font-medium text-white">
                Shop the edit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-[28px]">
                <Image src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" alt="Feature portfolio one" width={700} height={1000} className="h-[260px] w-full object-cover" priority loading="eager" />
              </div>
              <div className="overflow-hidden rounded-[28px]">
                <Image src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80" alt="Feature portfolio two" width={700} height={1000} className="h-[260px] w-full object-cover" loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <LotusOrnament className="h-9 w-9 rounded-full border border-[#d7c1af] bg-white/80 p-1.5" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Best sellers</p>
                <h2 className="font-serif text-4xl text-[#201614]">Loved by everyday style-makers</h2>
              </div>
            </div>
          </div>
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[36px] bg-[#f9efe8] p-5 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Why choose us</p>
              <h2 className="font-serif text-4xl text-[#201614]">Designed for confidence</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Premium quality", text: "Soft-touch fabrics and considered finishes for a boutique feel." },
              { title: "Easy shopping", text: "Mobile-first browsing, clear sizing and hassle-free delivery." },
              { title: "Trusted service", text: "Responsive support and verified reviews from happy customers." },
            ].map((feature) => (
              <div key={feature.title} className="rounded-[26px] bg-white p-5 shadow-[0_14px_30px_rgba(84,58,45,0.04)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f3e7db] text-[#4b1f1d]">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-medium text-xl text-[#201614]">{feature.title}</h3>
                <p className="text-sm leading-7 text-[#584942]">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <LotusOrnament className="h-9 w-9 rounded-full border border-[#d7c1af] bg-white/80 p-1.5" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a6f5f]">Customer love</p>
                <h2 className="font-serif text-4xl text-[#201614]">Reviews that feel like friends</h2>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.name} className="rounded-[30px] border border-[#ebddd5] bg-white p-5 shadow-[0_12px_28px_rgba(84,58,45,0.04)]">
                <div className="mb-4 flex items-center gap-2 text-[#b4872b]">
                  <Quote className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-[#201614]">{review.title}</h3>
                <p className="text-sm leading-7 text-[#584942]">“{review.text}”</p>
                <div className="mt-5 text-xs uppercase tracking-[0.18em] text-[#725f56]">{review.name}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 pt-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[36px] bg-[#2f1d1d] p-5 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#d8b89a]">Follow along</p>
              <h2 className="mt-2 font-serif text-4xl text-white">@admireboutique</h2>
            </div>
            <Link href="#" className="rounded-full border border-[#d8b89a] px-4 py-2 text-sm font-medium text-[#f8ebdf]">Instagram feed</Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
            ].map((image) => (
              <div key={image} className="overflow-hidden rounded-[26px]">
                <Image src={image} alt="Instagram style feed" width={900} height={1100} className="h-64 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
