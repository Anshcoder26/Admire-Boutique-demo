import Image from "next/image";
import { ArrowRight, Gem, ShoppingBag, ShieldCheck } from "lucide-react";
import { CategorySection } from "@/components/category-section";
import { HeroSection } from "@/components/hero-section";
import { FabricBooti } from "@/components/motifs/fabric-booti";
import { ProductGrid } from "@/components/product-grid";
import { InstagramFeed } from "@/components/instagram-feed";
import { SectionDivider } from "@/components/ui/section-divider";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
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

      <Section spacing="md">
        <SectionHeader
          eyebrow="Fresh Arrivals"
          title="New in Kurtis"
          action={
            <ButtonLink href="/products" variant="ghost" size="sm">
              View all <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          }
        />
        <ProductGrid products={newArrivals} />
      </Section>

      <SectionDivider className="my-2" />

      {/* Featured collection */}
      <Section spacing="md">
        <div className="relative isolate overflow-hidden rounded-[40px] border border-[#D4AF37]/25 bg-gradient-to-br from-[#fff7f2] to-[#f2e9df] p-6 shadow-[var(--shadow-md)] md:p-12">
          <FabricBooti opacity={0.05} size={140} motif="lotus" className="-z-10" />
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <p className="eyebrow mb-3">Featured Collection</p>
              <h2 className="font-serif text-4xl font-bold leading-tight text-[#7D1D1D] md:text-5xl lg:text-6xl">
                A softer way<br />to dress up.
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-[#5c4f49]">
                Thoughtful silhouettes, artisan finishes and the warmth of Indian craftsmanship brought together in one collection.
              </p>
              <div className="mt-8">
                <ButtonLink href="/products" variant="primary" size="lg">
                  Shop the Edit <ArrowRight className="h-5 w-5" />
                </ButtonLink>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-[28px] shadow-[var(--shadow-md)] transition-transform duration-300 hover:scale-[1.03]">
                <Image src="https://images.unsplash.com/photo-1765529374927-052599af9c82?auto=format&fit=crop&w=900&q=80" alt="Feature portfolio one" width={700} height={1000} className="h-[280px] w-full object-cover" priority loading="eager" />
              </div>
              <div className="mt-8 overflow-hidden rounded-[28px] shadow-[var(--shadow-md)] transition-transform duration-300 hover:scale-[1.03]">
                <Image src="https://images.unsplash.com/photo-1740992556750-e238834c3228?auto=format&fit=crop&w=900&q=80" alt="Feature portfolio two" width={700} height={1000} className="h-[280px] w-full object-cover" loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <SectionDivider className="my-2" />

      <Section spacing="md">
        <SectionHeader eyebrow="Best Sellers" title="Loved by Everyone" />
        <ProductGrid products={bestSellers} />
      </Section>

      {/* Why choose us */}
      <Section spacing="md">
        <SectionHeader
          eyebrow="Why Choose Us"
          title="Designed for Confidence"
          align="center"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Premium Quality", text: "Soft-touch fabrics and considered finishes for a boutique feel.", Icon: Gem },
            { title: "Easy Shopping", text: "Mobile-first browsing, clear sizing and hassle-free delivery.", Icon: ShoppingBag },
            { title: "Trusted Service", text: "Responsive support and verified reviews from happy customers.", Icon: ShieldCheck },
          ].map((feature) => (
            <div key={feature.title} className="group rounded-[28px] border border-[#7D1D1D]/10 bg-white p-7 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:shadow-[var(--shadow-lg)]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7D1D1D]/8 text-[#7D1D1D] transition-colors group-hover:bg-[#7D1D1D] group-hover:text-white">
                <feature.Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-serif text-2xl font-bold text-[#201614]">{feature.title}</h3>
              <p className="text-base leading-7 text-[#584942]">{feature.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Reviews */}
      <Section spacing="md">
        <SectionHeader eyebrow="Customer Love" title="Reviews That Feel Like Friends" align="center" />
        <div className="grid gap-6 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.name} className="group rounded-[28px] border border-[#D4AF37]/25 bg-white p-7 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-[var(--shadow-md)]">
              <div className="mb-4 flex items-center gap-1 text-xl text-[#D4AF37]">{"★".repeat(5)}</div>
              <h3 className="mb-3 font-serif text-xl font-bold text-[#201614]">{review.title}</h3>
              <p className="mb-6 text-base leading-8 italic text-[#584942]">&quot;{review.text}&quot;</p>
              <div className="border-t border-[#D4AF37]/20 pt-4">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#7D1D1D]">— {review.name}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Instagram */}
      <Section spacing="lg">
        <div className="rounded-[40px] border border-[#D4AF37]/25 bg-gradient-to-br from-[#2b1b1b] via-[#1a1612] to-[#1f1814] p-6 text-white shadow-[var(--shadow-lg)] md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Follow Our Style</p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-[#D4AF37] sm:text-4xl md:text-5xl lg:text-6xl">@admire_boutique.ab</h2>
            </div>
            <ButtonLink href="https://www.instagram.com/admire_boutique.ab/" variant="outline" size="md" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10" target="_blank">
              Follow Us
            </ButtonLink>
          </div>
          <InstagramFeed />
        </div>
      </Section>
    </main>
  );
}
