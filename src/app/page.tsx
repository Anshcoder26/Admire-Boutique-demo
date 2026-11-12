import { ArrowRight, Gem, ShoppingBag, ShieldCheck } from "lucide-react";
import { CategorySection } from "@/components/category-section";
import { HeroIntro } from "@/components/hero-intro";
import { ArtMotif } from "@/components/motifs/art-motif";
import { ProductGrid } from "@/components/product-grid";
import { InstagramFeed } from "@/components/instagram-feed";
import { SectionDivider } from "@/components/ui/section-divider";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { HomeReviews } from "@/components/reviews/home-reviews";
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

      <CategorySection products={products} />

      <Section spacing="md" className="relative overflow-hidden">
        <ArtMotif motif="peacock" size={340} mobileSize={150} opacity={0.4} className="absolute right-[-40px] top-4 z-0 md:top-10 xl:right-0" />
        <div className="relative z-10">
        <Reveal>
          <SectionHeader
            eyebrow="Fresh Arrivals"
            title="New in Suits"
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

      <Section spacing="md" className="relative overflow-hidden">
        <ArtMotif motif="peacock" size={340} mobileSize={150} opacity={0.4} flip className="absolute left-[-40px] top-4 z-0 md:top-10 xl:left-0" />
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
        <HomeReviews />
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
