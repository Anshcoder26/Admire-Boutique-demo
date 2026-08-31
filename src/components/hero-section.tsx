import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PaisleyMotif } from "./motifs/paisley-motif";
import { motifOpacity, motifColors } from "./motifs/motif-utils";

export function HeroSection() {
  return (
    <section className="indian-branch relative overflow-hidden bg-gradient-to-br from-[#fef9f5] via-[#f7efe8] to-[#efe5dc] px-4 pb-12 pt-6 md:px-8 lg:px-10">
      {/* Vibrant gradient overlay ornaments */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-[#7D1D1D]/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-32 right-20 w-96 h-96 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-tl from-[#8B7355]/12 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Animated lotus motifs - top left */}
      <div className="absolute top-20 left-5 w-12 h-12 opacity-30 animate-float-elegant md:opacity-40">
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <path d="M30 10 C 40 15, 45 25, 45 35 C 40 40, 35 41, 30 37 C 25 41, 20 40, 15 35 C 15 25, 20 15, 30 10 Z" fill="none" stroke="#7D1D1D" strokeWidth="1.5" />
          <path d="M30 10 C 35 18, 38 25, 38 35 C 34 39, 30 40, 30 35" fill="none" stroke="#D4AF37" strokeWidth="0.8" opacity="0.6" />
          <circle cx="30" cy="30" r="3" fill="#D4AF37" />
        </svg>
      </div>

      {/* Paisley motif - top-left corner */}
      <div className="absolute top-8 left-2 w-16 h-16 opacity-25 animate-float-elegant hidden md:block">
        <PaisleyMotif
          size="lg"
          opacity={motifOpacity.light}
          color={motifColors.primary}
          variant="filled"
        />
      </div>

      {/* Animated lotus motifs - top right */}
      <div className="absolute top-40 right-8 w-10 h-10 opacity-20 animate-float-elegant md:opacity-35" style={{ animationDelay: "1s" }}>
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <path d="M30 10 C 40 15, 45 25, 45 35 C 40 40, 35 41, 30 37 C 25 41, 20 40, 15 35 C 15 25, 20 15, 30 10 Z" fill="none" stroke="#8B7355" strokeWidth="1.2" />
          <circle cx="30" cy="30" r="2.5" fill="#7D1D1D" />
        </svg>
      </div>

      {/* Animated lotus motifs - bottom right */}
      <div className="absolute bottom-20 right-12 w-14 h-14 opacity-25 animate-float-elegant md:opacity-40" style={{ animationDelay: "2s" }}>
        <svg viewBox="0 0 60 60" className="h-full w-full">
          <path d="M30 10 C 40 15, 45 25, 45 35 C 40 40, 35 41, 30 37 C 25 41, 20 40, 15 35 C 15 25, 20 15, 30 10 Z" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="3" fill="#7D1D1D" />
        </svg>
      </div>

      {/* Paisley motif - bottom-right corner */}
      <div className="absolute bottom-12 right-4 w-20 h-20 opacity-30 animate-float-elegant hidden md:block" style={{ animationDelay: "1.5s" }}>
       <PaisleyMotif
         size="xl"
         opacity={motifOpacity.light}
         color={motifColors.secondary}
         variant="outline"
       />
      </div>

      {/* Branch ornament with vibrant colors */}
      <div className="branch-ornament hidden md:block" aria-hidden="true">
        <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet">
          <path className="branch animate-spin-slow" d="M120 600 C 200 520, 220 420, 310 360 C 360 330, 400 280, 420 230" />
          <path className="branch branch-warm" d="M140 540 C 245 470, 260 410, 340 360 C 395 322, 455 270, 470 210" style={{ animationDelay: "-2s" }} />
          <path className="branch" d="M760 620 C 680 540, 670 430, 620 360 C 580 300, 540 250, 490 220" style={{ animationDelay: "-4s" }} />
          <path className="branch branch-warm" d="M820 580 C 720 500, 710 420, 655 350 C 620 296, 570 260, 520 220" style={{ animationDelay: "-6s" }} />
          <path className="branch" d="M340 330 C 290 260, 300 190, 325 150" />
          <path className="branch branch-warm" d="M635 345 C 685 268, 675 192, 650 145" />
          <ellipse className="leaf-node animate-pulse" cx="290" cy="410" rx="24" ry="18" transform="rotate(-18 290 410)" />
          <ellipse className="leaf-node leaf-node-warm" cx="368" cy="332" rx="22" ry="18" transform="rotate(24 368 332)" />
          <ellipse className="leaf-node" cx="510" cy="285" rx="22" ry="16" transform="rotate(-10 510 285)" />
          <ellipse className="leaf-node leaf-node-warm" cx="695" cy="372" rx="26" ry="18" transform="rotate(12 695 372)" />
          <ellipse className="leaf-node" cx="620" cy="252" rx="24" ry="17" transform="rotate(22 620 252)" />
          <ellipse className="leaf-node leaf-node-warm" cx="350" cy="205" rx="18" ry="14" transform="rotate(-25 350 205)" />
          <ellipse className="leaf-node" cx="660" cy="192" rx="18" ry="14" transform="rotate(30 660 192)" />
        </svg>
      </div>

      {/* Animated leaf clusters */}
      <div className="leaf-cluster hidden md:block animate-float" aria-hidden="true">
        <div className="botanical-leaf" />
        <div className="botanical-leaf terracotta" />
        <div className="botanical-leaf" />
        <div className="botanical-leaf terracotta" />
      </div>

      <div className="hero-leaf-cluster hidden md:block animate-float" style={{ animationDelay: "-3s" }} aria-hidden="true">
        <div className="botanical-leaf terracotta" />
        <div className="botanical-leaf" />
        <div className="botanical-leaf terracotta" />
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left content with vibrant design */}
          <div className="rounded-[32px] bg-gradient-to-br from-[#fff5f0] to-[#f4ece6] p-8 shadow-[0_20px_50px_rgba(125,29,29,0.12)] md:p-10 lg:p-12 border border-[#D4AF37]/20 hover:shadow-[0_20px_60px_rgba(125,29,29,0.18)] transition-all duration-300">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7D1D1D]/30 bg-gradient-to-r from-[#7D1D1D]/10 to-[#D4AF37]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7D1D1D] hover:bg-gradient-to-r hover:from-[#7D1D1D]/15 hover:to-[#D4AF37]/15 transition-all">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Festival Collection
            </div>
            
            <h1 className="font-serif text-5xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#7D1D1D] via-[#8B7355] to-[#D4AF37] md:text-6xl lg:text-7xl font-bold hover:animate-float">
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
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gradient-to-bl from-[#7D1D1D] blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-gradient-to-tr from-[#8B7355] blur-3xl animate-pulse" style={{ animationDelay: "-1s" }} />
            </div>

            {/* Leaf spray SVG */}
            <div className="leaf-spray hidden sm:block animate-float" aria-hidden="true">
              <svg viewBox="0 0 500 500">
                <path d="M120 330 C 180 250, 210 180, 180 120 C 120 150, 90 220, 80 290" />
                <path d="M250 360 C 315 268, 352 190, 325 120 C 255 150, 225 220, 220 300" className="accent" />
                <path d="M350 330 C 392 260, 425 200, 410 120 C 360 150, 328 230, 320 285" />
              </svg>
            </div>

            <div className="relative flex h-full items-end justify-center">
              <div className="group relative h-[380px] w-[280px] overflow-hidden rounded-[28px] bg-gradient-to-b from-[#fff5f0] to-[#f5e8f5] shadow-lg transition-all duration-300 hover:shadow-2xl">
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
