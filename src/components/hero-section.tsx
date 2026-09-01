import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PaisleyMotif } from "./motifs/paisley-motif";
import { FabricBooti } from "./motifs/fabric-booti";
import { motifOpacity, motifColors } from "./motifs/motif-utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fef9f5] via-[#f7efe8] to-[#efe5dc] px-4 pb-12 pt-6 md:px-8 lg:px-10">
      {/* Subtle Indian suit-fabric booti texture */}
      <FabricBooti opacity={0.16} size={150} motif="lotus" />

      {/* Subtle paisley accent - top-left corner */}
      <div className="absolute top-8 left-3 w-16 h-16 hidden md:block">
        <PaisleyMotif
          size="lg"
          opacity={motifOpacity.light}
          color={motifColors.primary}
          variant="outline"
        />
      </div>

      {/* Subtle paisley accent - bottom-right corner */}
      <div className="absolute bottom-12 right-5 w-20 h-20 hidden md:block">
       <PaisleyMotif
         size="lg"
         opacity={motifOpacity.light}
         color={motifColors.secondary}
         variant="outline"
       />
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left content with vibrant design */}
          <div className="rounded-[32px] bg-gradient-to-br from-[#fff5f0] to-[#f4ece6] p-8 shadow-[0_20px_50px_rgba(125,29,29,0.12)] md:p-10 lg:p-12 border border-[#D4AF37]/20 hover:shadow-[0_20px_60px_rgba(125,29,29,0.18)] transition-all duration-300">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7D1D1D]/30 bg-gradient-to-r from-[#7D1D1D]/10 to-[#D4AF37]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7D1D1D] hover:bg-gradient-to-r hover:from-[#7D1D1D]/15 hover:to-[#D4AF37]/15 transition-all">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Festival Collection
            </div>
            
            <h1 className="font-serif text-4xl leading-tight text-[#7D1D1D] sm:text-5xl md:text-6xl lg:text-7xl font-bold">
              Rooted in tradition.
              <span className="mt-2 block text-[#8B7355]">Made for today.</span>
            </h1>
            
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5d413d]">
              Discover premium kurtis, festive edits and effortless everyday pieces curated for the modern Indian woman.
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7D1D1D] to-[#8B7355] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#7D1D1D]/30 transition-all hover:shadow-2xl hover:shadow-[#7D1D1D]/50 hover:scale-110 active:scale-95 hover:animate-subtle-pulse"
              >
                Shop Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#8B7355] bg-white/60 px-8 py-4 text-base font-semibold text-[#7D1D1D] transition-all hover:bg-[#8B7355]/10 hover:scale-110 active:scale-95 hover:border-[#7D1D1D]"
              >
                Explore Collection
              </Link>
            </div>
            
            {/* Stats with vibrant badges */}
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#7D1D1D]/10 to-[#D4AF37]/10 px-5 py-3 border border-[#7D1D1D]/20">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8B7355]">Happy Customers</span>
                  <span className="text-2xl font-bold text-[#7D1D1D]">14k+</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#D4AF37]/10 to-[#8B7355]/10 px-5 py-3 border border-[#D4AF37]/20">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8B7355]">Rating</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">4.8★</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Feature card with vibrant gradient */}
          <div className="relative min-h-[450px] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#fff5f0] via-[#f7efe8] to-[#f0e7de] p-6 shadow-[0_25px_50px_rgba(125,29,29,0.15)] border border-[#D4AF37]/20">
            <div className="relative flex h-full items-end justify-center">
              <div className="group relative h-[380px] w-[280px] overflow-hidden rounded-[28px] bg-gradient-to-b from-[#fff5f0] to-[#f5ede7] shadow-lg transition-all duration-300 hover:shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
                  alt="Featured Saffron Silk Kurti"
                  width={560}
                  height={760}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                {/* Product showcase area with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#140f0e]/65 via-transparent to-[#7D1D1D]/20" />
                
                {/* Decorative geometric pattern */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#8B7355] opacity-10 rounded-full -ml-16 -mb-16 blur-2xl" />
                </div>

                {/* Content card */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] mb-4 rounded-2xl bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-3 shadow-lg border border-[#7D1D1D]/20 group-hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8B7355]">Featured</p>
                      <h2 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7D1D1D] to-[#D4AF37]">Saffron Silk Kurti</h2>
                    </div>
                    <span className="text-lg font-bold text-[#7D1D1D]">₹1,899</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
