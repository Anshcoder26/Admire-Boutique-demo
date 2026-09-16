"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { FabricBooti } from "./motifs/fabric-booti";
import { ButtonLink } from "@/components/ui/button";

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const MAROON: [number, number, number] = [125, 29, 29];
const IVORY: [number, number, number] = [251, 250, 247];

function mixRgb(a: [number, number, number], b: [number, number, number], t: number) {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** Editorial hero content (headline, subcopy, CTAs, stats). Rendered dark on ivory. */
function HeroContent() {
  return (
    <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 text-center md:px-8">
      <div className="mb-7 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#7D1D1D]">
        <span aria-hidden className="h-px w-8 bg-[#7D1D1D]" />
        Festival Collection 2026
        <span aria-hidden className="h-px w-8 bg-[#7D1D1D]" />
      </div>

      <h1 className="display-hero text-[clamp(2.85rem,9vw,7.5rem)] leading-[0.9]">
        Rooted in tradition,
        <span className="mt-1 block text-[#7D1D1D]">made for today.</span>
      </h1>

      <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--ink)]/70 md:text-xl">
        Premium kurtis, festive edits and effortless everyday pieces —
        curated with the warmth of Indian craftsmanship for the modern woman.
      </p>

      <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <ButtonLink href="/products" variant="primary" size="lg" fullWidth className="sm:w-auto">
          Shop the Collection <ArrowRight className="h-5 w-5" />
        </ButtonLink>
        <ButtonLink href="/products" variant="outline" size="lg" fullWidth className="sm:w-auto">
          Explore Fabrics
        </ButtonLink>
      </div>

      <div className="mt-14 flex items-center justify-center gap-8 md:gap-12">
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
  );
}

/**
 * Scroll-driven brand intro that MORPHS in place into the hero.
 *
 * A tall track pins a full-screen stage. As the user scrolls, the stage's
 * background interpolates maroon -> ivory, the "Admire Boutique" splash fades
 * out and the editorial hero content fades in — one continuous transformation
 * (not a curtain lifting to reveal a separate section beneath).
 *
 * The site chrome (header + bottom nav) is hidden during the maroon splash and
 * fades in as the stage morphs into the hero, via the `intro-active` class on
 * <html> (see globals.css `.site-chrome`).
 *
 * For reduced-motion users the animation is skipped: a static hero renders on
 * the ivory canvas and the chrome stays visible.
 */
export function HeroIntro() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => setEnabled(false));
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(total > 0 ? scrolled / total : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Hide the header + bottom nav while the maroon splash is on screen; reveal
  // them as the stage morphs into the ivory hero.
  useEffect(() => {
    const root = document.documentElement;
    if (!enabled) {
      root.classList.remove("intro-active");
      return;
    }
    root.classList.toggle("intro-active", progress < 0.52);
    return () => root.classList.remove("intro-active");
  }, [progress, enabled]);

  // Reduced-motion / fallback: static hero on the ivory canvas.
  if (!enabled) {
    return (
      <section className="relative overflow-hidden bg-[var(--background)] pb-12 pt-14 md:pb-16 md:pt-24 lg:pt-28">
        <FabricBooti opacity={0.05} mobileOpacity={0.03} size={170} motif="lotus" />
        <div className="relative z-10">
          <HeroContent />
        </div>
      </section>
    );
  }

  const bgT = smoothstep(0.4, 0.62, progress);
  const background = mixRgb(MAROON, IVORY, bgT);

  // Splash ("Admire Boutique") — visible on maroon, eases out before the wipe.
  const brandOpacity = 1 - smoothstep(0.26, 0.46, progress);
  const brandShift = -smoothstep(0.1, 0.5, progress) * 48;
  const brandScale = 1 + smoothstep(0, 0.5, progress) * 0.08;
  const hintOpacity = 1 - smoothstep(0, 0.12, progress);

  // Hero content — fades in once the background has become ivory.
  const heroOpacity = smoothstep(0.58, 0.82, progress);
  const heroShift = (1 - smoothstep(0.55, 0.85, progress)) * 32;

  // While the maroon splash is up, the stage sits above the chrome (z-[60]) so
  // there's no header flash on load. Once the chrome is revealed, drop the stage
  // below the header (z-40) so the header shows on top of the morphed hero.
  const chromeRevealed = progress >= 0.52;

  return (
    <div ref={trackRef} className="relative h-[220vh]">
      <div
        className={`sticky top-0 flex h-screen items-center justify-center overflow-hidden ${
          chromeRevealed ? "z-40" : "z-[60]"
        }`}
        style={{ backgroundColor: background }}
      >
        {/* Splash layer */}
        <div
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{ opacity: brandOpacity, pointerEvents: "none" }}
        >
          <FabricBooti opacity={0.08} mobileOpacity={0.06} size={200} motif="lotus" />
          <span aria-hidden className="pointer-events-none absolute inset-x-8 top-10 h-px bg-white/15" />
          <span aria-hidden className="pointer-events-none absolute inset-x-8 bottom-10 h-px bg-white/15" />
          <div
            className="relative flex flex-col items-center px-6 text-center"
            style={{ transform: `translateY(${brandShift}px) scale(${brandScale})` }}
          >
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#E6C866]">
              Est. Admire · Since 2024
            </p>
            <h1 className="display-hero text-[clamp(3rem,12vw,9rem)] leading-[0.9] text-white">
              Admire Boutique
            </h1>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.32em] text-white/70">
              Unstitched Suit Materials
            </p>
          </div>
        </div>

        {/* Hero layer */}
        <div
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{
            opacity: heroOpacity,
            transform: `translateY(${heroShift}px)`,
            pointerEvents: heroOpacity > 0.6 ? "auto" : "none",
          }}
        >
          <HeroContent />
        </div>

        {/* Scroll hint */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-white/70"
          style={{ opacity: hintOpacity }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
          <span aria-hidden className="animate-bounce-gentle text-lg">↓</span>
        </div>
      </div>
    </div>
  );
}
