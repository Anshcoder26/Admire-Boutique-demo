import { ArrowRight } from "lucide-react";
import { FabricBooti } from "./motifs/fabric-booti";
import { ButtonLink } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";

const marqueeWords = [
  "Handcrafted in India",
  "Unstitched Suit Materials",
  "Festive Edits 2026",
  "Premium Cotton & Mul",
  "Made for Today",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--background)]">
      {/* Subtle Indian suit-fabric booti texture */}
      <FabricBooti opacity={0.05} mobileOpacity={0.03} size={170} motif="lotus" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-12 pt-14 text-center md:px-8 md:pb-16 md:pt-24 lg:pt-28">
        <div
          className="hero-enter mb-7 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7D1D1D]"
          style={{ ["--enter-delay" as string]: "40ms" }}
        >
          <span aria-hidden className="h-px w-8 bg-[#7D1D1D]" />
          Festival Collection 2026
          <span aria-hidden className="h-px w-8 bg-[#7D1D1D]" />
        </div>

        <h1
          className="hero-enter display-hero text-[clamp(2.85rem,9vw,7.5rem)] leading-[0.9]"
          style={{ ["--enter-delay" as string]: "140ms" }}
        >
          Rooted in tradition,
          <span className="mt-1 block text-[#7D1D1D]">made for today.</span>
        </h1>

        <p
          className="hero-enter mt-8 max-w-2xl text-lg leading-8 text-[var(--ink)]/70 md:text-xl"
          style={{ ["--enter-delay" as string]: "260ms" }}
        >
          Premium kurtis, festive edits and effortless everyday pieces —
          curated with the warmth of Indian craftsmanship for the modern woman.
        </p>

        <div
          className="hero-enter mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
          style={{ ["--enter-delay" as string]: "360ms" }}
        >
          <ButtonLink href="/products" variant="primary" size="lg" fullWidth className="sm:w-auto">
            Shop the Collection <ArrowRight className="h-5 w-5" />
          </ButtonLink>
          <ButtonLink href="/products" variant="outline" size="lg" fullWidth className="sm:w-auto">
            Explore Fabrics
          </ButtonLink>
        </div>

        <div
          className="hero-enter mt-14 flex items-center justify-center gap-8 md:gap-12"
          style={{ ["--enter-delay" as string]: "460ms" }}
        >
          <div className="flex flex-col">
            <span className="font-serif text-3xl font-semibold text-[var(--ink)] md:text-4xl">14k+</span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/50">Happy Customers</span>
          </div>
          <span aria-hidden className="h-10 w-px bg-[var(--ink)]/15" />
          <div className="flex flex-col">
            <span className="font-serif text-3xl font-semibold text-[var(--ink)] md:text-4xl">4.8★</span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/50">Average Rating</span>
          </div>
          <span aria-hidden className="hidden h-10 w-px bg-[var(--ink)]/15 sm:block" />
          <div className="hidden flex-col sm:flex">
            <span className="font-serif text-3xl font-semibold text-[var(--ink)] md:text-4xl">200+</span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/50">Curated Styles</span>
          </div>
        </div>
      </div>

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
    </section>
  );
}
