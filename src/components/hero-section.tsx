import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { PaisleyMotif } from "./motifs/paisley-motif";
import { FabricBooti } from "./motifs/fabric-booti";
import { ButtonLink } from "@/components/ui/button";
import { motifOpacity, motifColors } from "./motifs/motif-utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fef9f5] to-[#f5ece4] px-4 pb-14 pt-8 md:px-8 md:pb-20 md:pt-12 lg:px-10">
      {/* Subtle Indian suit-fabric booti texture */}
      <FabricBooti opacity={0.12} mobileOpacity={0.07} size={150} motif="lotus" />

      {/* Subtle paisley accents */}
      <div className="absolute top-8 left-3 hidden h-16 w-16 md:block">
        <PaisleyMotif size="lg" opacity={motifOpacity.light} color={motifColors.primary} variant="outline" />
      </div>
      <div className="absolute bottom-12 right-5 hidden h-20 w-20 md:block">
        <PaisleyMotif size="lg" opacity={motifOpacity.light} color={motifColors.secondary} variant="outline" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left — editorial copy on open background */}
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7D1D1D]">
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              Festival Collection
            </div>

            <h1 className="font-serif text-[2.75rem] font-bold leading-[1.05] text-[#7D1D1D] sm:text-6xl lg:text-7xl">
              Rooted in tradition.
              <span className="mt-1 block text-[#8B7355]">Made for today.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#5d413d] md:text-lg lg:mx-0">
              Discover premium kurtis, festive edits and effortless everyday pieces curated for the modern Indian woman.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <ButtonLink href="/products" variant="primary" size="lg">
                Shop Now <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/products" variant="outline" size="lg">
                Explore Collection
              </ButtonLink>
            </div>

            {/* Stats */}
            <div className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-bold text-[#7D1D1D] md:text-4xl">14k+</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B7355]">Happy Customers</span>
              </div>
              <span aria-hidden className="h-10 w-px bg-[#D4AF37]/40" />
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-bold text-[#7D1D1D] md:text-4xl">4.8★</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B7355]">Average Rating</span>
              </div>
            </div>
          </div>

          {/* Right — featured product image */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="group relative overflow-hidden rounded-[28px] border border-[#D4AF37]/25 shadow-[var(--shadow-lg)]">
              <Image
                src="https://images.unsplash.com/photo-1759840278862-ef629e9b0f64?auto=format&fit=crop&w=900&q=80"
                alt="Featured Saffron Silk Kurti"
                width={560}
                height={760}
                className="h-[380px] w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-[500px]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140f0e]/55 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/50 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8B7355]">Featured</p>
                    <h2 className="font-serif text-base font-bold text-[#7D1D1D]">Saffron Silk Kurti</h2>
                  </div>
                  <span className="font-serif text-lg font-bold text-[#7D1D1D]">₹1,899</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
