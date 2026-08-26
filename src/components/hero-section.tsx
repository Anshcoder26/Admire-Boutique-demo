import Link from "next/link";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="indian-branch relative overflow-hidden bg-[#f6f0ea] px-4 pb-8 pt-4 md:px-8 lg:px-10">
      <div className="branch-ornament hidden md:block" aria-hidden="true">
        <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet">
          <path className="branch" d="M120 600 C 200 520, 220 420, 310 360 C 360 330, 400 280, 420 230" />
          <path className="branch branch-warm" d="M140 540 C 245 470, 260 410, 340 360 C 395 322, 455 270, 470 210" />
          <path className="branch" d="M760 620 C 680 540, 670 430, 620 360 C 580 300, 540 250, 490 220" />
          <path className="branch branch-warm" d="M820 580 C 720 500, 710 420, 655 350 C 620 296, 570 260, 520 220" />
          <path className="branch" d="M340 330 C 290 260, 300 190, 325 150" />
          <path className="branch branch-warm" d="M635 345 C 685 268, 675 192, 650 145" />
          <ellipse className="leaf-node" cx="290" cy="410" rx="24" ry="18" transform="rotate(-18 290 410)" />
          <ellipse className="leaf-node leaf-node-warm" cx="368" cy="332" rx="22" ry="18" transform="rotate(24 368 332)" />
          <ellipse className="leaf-node" cx="510" cy="285" rx="22" ry="16" transform="rotate(-10 510 285)" />
          <ellipse className="leaf-node leaf-node-warm" cx="695" cy="372" rx="26" ry="18" transform="rotate(12 695 372)" />
          <ellipse className="leaf-node" cx="620" cy="252" rx="24" ry="17" transform="rotate(22 620 252)" />
          <ellipse className="leaf-node leaf-node-warm" cx="350" cy="205" rx="18" ry="14" transform="rotate(-25 350 205)" />
          <ellipse className="leaf-node" cx="660" cy="192" rx="18" ry="14" transform="rotate(30 660 192)" />
        </svg>
      </div>

      <div className="leaf-cluster hidden md:block" aria-hidden="true">
        <div className="botanical-leaf" />
        <div className="botanical-leaf terracotta" />
        <div className="botanical-leaf" />
        <div className="botanical-leaf terracotta" />
      </div>

      <div className="hero-leaf-cluster hidden md:block" aria-hidden="true">
        <div className="botanical-leaf terracotta" />
        <div className="botanical-leaf" />
        <div className="botanical-leaf terracotta" />
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-[32px] bg-[#f5e8dc] p-6 shadow-[0_20px_35px_rgba(82,60,45,0.06)] md:p-8 lg:p-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c8b19a] bg-white/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#7a4a3c]">
              <Sparkles className="h-3.5 w-3.5" />
              Everyday elegance
            </div>
            <h1 className="font-serif text-5xl leading-none text-[#261714] md:text-6xl lg:text-7xl">
              Rooted in tradition.
              <span className="mt-2 block text-[#7f3f36]">Made for today.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5d413d] md:text-lg">
              Discover premium kurtis, festive edits and effortless everyday pieces curated for the modern Indian woman.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4b1f1d] px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-[#4b1f1d]/20 transition hover:bg-[#341514]"
              >
                Shop kurtis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products?category=festive"
                className="inline-flex items-center justify-center rounded-full border border-[#9a7a67] bg-white/60 px-6 py-3.5 text-sm font-medium text-[#3b251f] transition hover:bg-white/80"
              >
                Festive edit
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-[#5d413d]">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-2">
                <Leaf className="h-4 w-4 text-[#56714d]" />
                <span className="block text-2xl font-semibold text-[#2d1d1a]">14k+</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-2">
                <Sparkles className="h-4 w-4 text-[#b46d44]" />
                <span className="block text-2xl font-semibold text-[#2d1d1a]">4.8/5</span>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-[32px] bg-[#edd9c9] p-4 shadow-[0_22px_40px_rgba(70,48,38,0.1)]">
            <div className="leaf-spray hidden sm:block" aria-hidden="true">
              <svg viewBox="0 0 500 500">
                <path d="M120 330 C 180 250, 210 180, 180 120 C 120 150, 90 220, 80 290" />
                <path d="M250 360 C 315 268, 352 190, 325 120 C 255 150, 225 220, 220 300" className="accent" />
                <path d="M350 330 C 392 260, 425 200, 410 120 C 360 150, 328 230, 320 285" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.75),_transparent_35%)]" />
            <div className="absolute right-4 top-4 rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#6c3a2a] backdrop-blur-sm">
              new arrival
            </div>
            <div className="relative flex h-full items-end justify-center">
              <div className="relative h-[420px] w-[320px] rounded-[28px] bg-[linear-gradient(180deg,_rgba(157,99,72,0.12),_rgba(81,33,27,0.18))] shadow-[inset_0_0_0_1px_rgba(71,52,41,0.08)]">
                <div className="absolute left-1/2 top-8 h-[260px] w-[200px] -translate-x-1/2 rounded-[44%_56%_48%_52%/58%_40%_60%_42%] border-[10px] border-[#f9e7d4] bg-[radial-gradient(circle_at_50%_14%,_rgba(154,104,80,0.35),_rgba(99,60,51,0.9)_65%,_rgba(60,37,31,1)_100%)] shadow-[0_18px_28px_rgba(79,41,31,0.18)]" />
                <div className="absolute bottom-0 left-1/2 h-[200px] w-[260px] -translate-x-1/2 rounded-t-[120px] bg-[linear-gradient(180deg,_#f2e7dd,_#dcc0a4)] shadow-[inset_0_2px_12px_rgba(255,255,255,0.5)]" />
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/75 px-4 py-2 backdrop-blur-md">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#866d5a]">Featured</p>
                    <h2 className="text-lg font-medium text-[#2a1d1a]">Saffron Silk</h2>
                  </div>
                  <span className="text-lg font-semibold text-[#7c3f35]">₹1,899</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
