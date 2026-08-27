import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="indian-branch relative overflow-hidden bg-gradient-to-br from-[#fef9f5] via-[#f5e6f0] to-[#e8f4f8] px-4 pb-12 pt-6 md:px-8 lg:px-10">
      {/* Vibrant gradient overlay ornaments */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-[#c94a6a]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-32 right-20 w-96 h-96 bg-gradient-to-bl from-[#6f2fbf]/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-tl from-[#00a8cc]/10 to-transparent rounded-full blur-3xl" />
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
          <div className="rounded-[32px] bg-gradient-to-br from-[#fff5f0] to-[#f0e8f5] p-8 shadow-[0_20px_50px_rgba(216,30,143,0.12)] md:p-10 lg:p-12 border border-[#e6a86a]/20">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c94a6a]/30 bg-gradient-to-r from-[#c94a6a]/10 to-[#6f2fbf]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c94a6a]">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Festival Collection
            </div>
            
            <h1 className="font-serif text-5xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#c94a6a] via-[#6f2fbf] to-[#00a8cc] md:text-6xl lg:text-7xl font-bold">
              Rooted in tradition.
              <span className="block text-gradient-to-r from-[#e6a86a] to-[#ff6b35] mt-2">Made for today.</span>
            </h1>
            
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5d413d]">
              Discover premium kurtis, festive edits and effortless everyday pieces curated for the modern Indian woman.
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c94a6a] to-[#a81566] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#c94a6a]/30 transition-all hover:shadow-xl hover:shadow-[#c94a6a]/50 hover:scale-105 active:scale-95"
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#6f2fbf] bg-white/60 px-8 py-4 text-base font-semibold text-[#6f2fbf] transition-all hover:bg-[#6f2fbf]/10 hover:scale-105 active:scale-95"
              >
                Explore Collection
              </Link>
            </div>
            
            {/* Stats with vibrant badges */}
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#c94a6a]/10 to-[#e6a86a]/10 px-5 py-3 border border-[#c94a6a]/20">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6f2fbf]">Happy Customers</span>
                  <span className="text-2xl font-bold text-[#c94a6a]">14k+</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#e6a86a]/10 to-[#00a8cc]/10 px-5 py-3 border border-[#e6a86a]/20">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#00a8cc]">Rating</span>
                  <span className="text-2xl font-bold text-[#e6a86a]">4.8★</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Feature card with vibrant gradient */}
          <div className="relative min-h-[450px] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#fff5f0] via-[#f5e8f5] to-[#e8f8f9] p-6 shadow-[0_25px_50px_rgba(216,30,143,0.15)] border border-[#e6a86a]/20">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#c94a6a] rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#00a8cc] rounded-full blur-3xl animate-pulse" style={{ animationDelay: "-1s" }} />
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
              <div className="relative h-[380px] w-[280px] rounded-[28px] bg-gradient-to-b from-[#fff5f0] to-[#f5e8f5] shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
                {/* Product showcase area with gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#c94a6a]/10 via-transparent to-[#00a8cc]/10" />
                
                {/* Decorative geometric pattern */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#e6a86a] opacity-10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#6f2fbf] opacity-10 rounded-full -ml-16 -mb-16 blur-2xl" />
                </div>

                {/* Content card */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] mb-4 rounded-2xl bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-3 shadow-lg border border-[#c94a6a]/20 group-hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6f2fbf]">Featured</p>
                      <h2 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c94a6a] to-[#e6a86a]">Saffron Silk Kurti</h2>
                    </div>
                    <span className="text-lg font-bold text-[#c94a6a]">₹1,899</span>
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
