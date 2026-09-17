import Image from "next/image";
import { ArrowRight, Gem, ShoppingBag, ShieldCheck } from "lucide-react";
import { CategorySection } from "@/components/category-section";
import { HeroIntro } from "@/components/hero-intro";
import { MotifTile } from "@/components/motifs/motif-tile";
import { ArtMotif } from "@/components/motifs/art-motif";
import { ProductGrid } from "@/components/product-grid";
import { InstagramFeed } from "@/components/instagram-feed";
import { SectionDivider } from "@/components/ui/section-divider";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { reviews } from "@/data/products";
import { getCatalogProducts } from "@/lib/catalog-store";

const marqueeWords = [
  "Handcrafted in India",
  "Unstitched Suit Materials",
  "Festive Edits 2026",
  "Premium Cotton & Mul",
  "Made for Today",
];

export default async function HomePage() {
  const products = await getCatalogProducts();
  const newArrivals = products.slice(0, 3);
  const bestSellers = products.slice(3, 6);

  return (
    <main>
      <HeroIntro />

      {/* Full-bleed editorial marquee band */}
      <div className="relative z-10 border-y border-[#7D1D1D]/15 bg-[#7D1D1D] py-4 text-white">
        <Marquee
          duration={30}
          items={marqueeWords.map((word) => (
            <span key={word} className="font-serif text-lg font-medium tracking-tight md:text-2xl">{word}</span>
          ))}
          separator={<span aria-hidden className="text-[#E6C866]">✦</span>}
        />
      </div>

      <CategorySection />

      <Section spacing="md" className="relative overflow-hidden">
        <ArtMotif motif="peacock" size={340} opacity={0.4} className="absolute right-0 top-10 z-0 hidden xl:block" />
        <div className="relative z-10">
        <Reveal>
          <SectionHeader
            eyebrow="Fresh Arrivals"
            title="New in Kurtis"
            action={
              <ButtonLink href="/products" variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            }
          />
        </Reveal>
        <ProductGrid products={newArrivals} />
        </div>
      </Section>

      <SectionDivider className="my-2" />

      {/* Featured collection */}
      <Section spacing="md">
        <Reveal variant="scale">
        <div className="relative isolate overflow-hidden rounded-xl bg-[#7D1D1D] p-6 text-white shadow-[var(--shadow-lg)] md:p-12">
          <MotifTile motif="lotus" opacity={0.1} mobileOpacity={0.06} size={150} className="-z-10" />
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#E9C766]">Featured Collection</p>
              <h2 className="font-serif text-4xl font-semibold leading-[0.95] tracking-tight text-white md:text-5xl lg:text-6xl">
                A softer way<br />to dress up.
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-white/75">
                Thoughtful silhouettes, artisan finishes and the warmth of Indian craftsmanship brought together in one collection.
              </p>
              <div className="mt-8">
                <ButtonLink href="/products" variant="light" size="lg">
                  Shop the Edit <ArrowRight className="h-5 w-5" />
                </ButtonLink>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-lg shadow-[var(--shadow-md)] transition-transform duration-300 hover:scale-[1.03]">
                <Image src="https://images.unsplash.com/photo-1765529374927-052599af9c82?auto=format&fit=crop&w=900&q=80" alt="Feature portfolio one" width={700} height={1000} className="h-[280px] w-full object-cover" priority loading="eager" />
              </div>
              <div className="mt-8 overflow-hidden rounded-lg shadow-[var(--shadow-md)] transition-transform duration-300 hover:scale-[1.03]">
                <Image src="https://images.unsplash.com/photo-1740992556750-e238834c3228?auto=format&fit=crop&w=900&q=80" alt="Feature portfolio two" width={700} height={1000} className="h-[280px] w-full object-cover" loading="eager" />
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      </Section>

      <SectionDivider className="my-2" />

      <Section spacing="md" className="relative overflow-hidden">
        <ArtMotif motif="peacock" size={340} opacity={0.4} flip className="absolute left-0 top-10 z-0 hidden xl:block" />
        <div className="relative z-10">
        <Reveal>
          <SectionHeader eyebrow="Best Sellers" title="Loved by Everyone" />
        </Reveal>
        <ProductGrid products={bestSellers} />
        </div>
      </Section>

      {/* Why choose us */}
      <Section spacing="md">
        <Reveal>
          <div className="flex flex-col items-center">
            <ArtMotif motif="lotus" size={92} opacity={0.9} />
            <SectionHeader
              eyebrow="Why Choose Us"
              title="Designed for Confidence"
              align="center"
            />
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Premium Quality", text: "Soft-touch fabrics and considered finishes for a boutique feel.", Icon: Gem },
            { title: "Easy Shopping", text: "Mobile-first browsing, clear sizing and hassle-free delivery.", Icon: ShoppingBag },
            { title: "Trusted Service", text: "Responsive support and verified reviews from happy customers.", Icon: ShieldCheck },
          ].map((feature, i) => (
            <Reveal key={feature.title} variant="up" delay={i * 100}>
            <div className="group h-full rounded-lg border border-[var(--ink)]/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#7D1D1D]/30 hover:shadow-[var(--shadow-md)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-[#7D1D1D] text-white">
                <feature.Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-serif text-2xl font-semibold text-[var(--ink)]">{feature.title}</h3>
              <p className="text-base leading-7 text-[var(--ink)]/70">{feature.text}</p>
            </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Reviews */}
      <Section spacing="md">
        <Reveal>
          <div className="flex flex-col items-center">
            <ArtMotif motif="lotus" size={92} opacity={0.9} />
            <SectionHeader eyebrow="Customer Love" title="Reviews That Feel Like Friends" align="center" />
          </div>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={review.name} variant="up" delay={i * 100}>
            <article className="group h-full rounded-lg border border-[var(--ink)]/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#7D1D1D]/30 hover:shadow-[var(--shadow-md)]">
              <div className="mb-4 flex items-center gap-1 text-lg text-[#D4AF37]">{"★".repeat(5)}</div>
              <h3 className="mb-3 font-serif text-xl font-semibold text-[var(--ink)]">{review.title}</h3>
              <p className="mb-6 text-base leading-8 italic text-[var(--ink)]/70">&quot;{review.text}&quot;</p>
              <div className="border-t border-[var(--ink)]/10 pt-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7D1D1D]">— {review.name}</p>
              </div>
            </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Instagram */}
      <Section spacing="lg">
        <Reveal variant="scale">
        <div className="rounded-xl bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-lg)] md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#E9C766]">Follow Our Style</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">@admire_boutique.ab</h2>
            </div>
            <ButtonLink href="https://www.instagram.com/admire_boutique.ab/" variant="outline" size="md" className="border-white text-white hover:bg-white/10" target="_blank">
              Follow Us
            </ButtonLink>
          </div>
          <InstagramFeed />
        </div>
        </Reveal>
      </Section>
    </main>
  );
}
