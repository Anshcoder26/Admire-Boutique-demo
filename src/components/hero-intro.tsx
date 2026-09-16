"use client";

import { useEffect, useRef, useState } from "react";
import { FabricBooti } from "./motifs/fabric-booti";

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Scroll-driven brand intro. A tall track pins a full-screen maroon stage
 * (layered above the header + bottom nav so they're hidden on landing).
 * As the user scrolls, "Admire Boutique" eases away and the pinned maroon
 * curtain lifts to reveal the site directly beneath — a single smooth motion.
 *
 * Disabled for reduced-motion users (renders nothing; site shows immediately).
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

  if (!enabled) return null;

  // "Admire Boutique" eases up and dissolves across most of the scroll…
  const brandOpacity = 1 - smoothstep(0.1, 0.7, progress);
  const brandShift = -smoothstep(0.1, 0.85, progress) * 60;
  const brandScale = 1 + smoothstep(0, 0.85, progress) * 0.09;
  const hintOpacity = 1 - smoothstep(0, 0.12, progress);

  return (
    <div ref={trackRef} className="relative h-[180vh]">
      <div className="sticky top-0 z-[60] flex h-screen items-center justify-center overflow-hidden bg-[#7D1D1D] text-white">
        <FabricBooti opacity={0.08} mobileOpacity={0.06} size={200} motif="lotus" />
        <span aria-hidden className="pointer-events-none absolute inset-x-8 top-10 h-px bg-white/15" />
        <span aria-hidden className="pointer-events-none absolute inset-x-8 bottom-10 h-px bg-white/15" />

        <div
          className="relative flex flex-col items-center px-6 text-center will-change-transform"
          style={{ opacity: brandOpacity, transform: `translateY(${brandShift}px) scale(${brandScale})` }}
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

        <div
          className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-white/70"
          style={{ opacity: hintOpacity }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
          <span aria-hidden className="animate-bounce-gentle text-lg">↓</span>
        </div>
      </div>
    </div>
  );
}
