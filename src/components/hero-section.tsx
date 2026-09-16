import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FabricBooti } from "./motifs/fabric-booti";
import { ButtonLink } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white px-4 pb-14 pt-8 md:px-8 md:pb-20 md:pt-14 lg:px-10">
      {/* Subtle Indian suit-fabric booti texture */}
      <FabricBooti opacity={0.05} mobileOpacity={0.03} size={150} motif="lotus" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-10 md:gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left — editorial copy on open background */}
          <div className="text-center lg:text-left">
            <div className="hero-enter mb-6 inline-flex items-center gap-2 border-b-2 border-[#7D1D1D] pb-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7D1D1D]" style={{ ['--enter-delay' as string]: '60ms' }}>
              Festival Collection 2026
            </div>

            <h1 className="hero-enter display-hero text-[3.25rem] leading-[0.92] text-[var(--ink)] sm:text-7xl lg:text-[5.5rem]" style={{ ['--enter-delay' as string]: '160ms' }}>
              Rooted in tradition.
              <span className="mt-2 block text-[#7D1D1D]">Made for today.</span>
            </h1>

            <p className="hero-enter mx-auto mt-7 max-w-xl text-base leading-8 text-[var(--ink)]/70 md:text-lg lg:mx-0" style={{ ['--enter-delay' as string]: '280ms' }}>
              Discover premium kurtis, festive edits and effortless everyday pieces curated for the modern Indian woman.
            </p>

            <div className="hero-enter mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" style={{ ['--enter-delay' as string]: '380ms' }}>
              <ButtonLink href="/products" variant="primary" size="lg">
                Shop Now <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/products" variant="outline" size="lg">
                Explore Collection
              </ButtonLink>
            </div>

            {/* Stats */}
            <div className="hero-enter mt-12 flex items-center justify-center gap-10 lg:justify-start" style={{ ['--enter-delay' as string]: '480ms' }}>
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-semibold text-[var(--ink)] md:text-4xl">14k+</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/50">Happy Customers</span>
              </div>
              <span aria-hidden className="h-10 w-px bg-[var(--ink)]/15" />
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-semibold text-[var(--ink)] md:text-4xl">4.8★</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/50">Average Rating</span>
              </div>
            </div>
          </div>

          {/* Right — featured product image */}
          <div className="hero-enter relative mx-auto w-full max-w-md" style={{ ['--enter-delay' as string]: '240ms' }}>
            <div className="group relative overflow-hidden rounded-lg border border-[var(--ink)]/10 shadow-[var(--shadow-lg)]">
              <Image
                src="https://images.unsplash.com/photo-1759840278862-ef629e9b0f64?auto=format&fit=crop&w=900&q=80"
                alt="Featured Saffron Silk Kurti"
                width={560}
                height={760}
                className="animate-ken-burns h-[380px] w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-[520px]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
