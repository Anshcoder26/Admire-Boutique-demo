import { motifColors } from "./motif-utils";

export type BootiMotif = "flower" | "lotus" | "peacock";

interface FabricBootiProps {
  className?: string;
  /** Final visible opacity of the textile layer (keep low: 0.04–0.12). */
  opacity?: number;
  /** Motif colour (defaults to brand maroon). */
  color?: string;
  /** Tile size in px. Larger = more spaced out. */
  size?: number;
  /** Which repeating motif to use. */
  motif?: BootiMotif;
}

/**
 * FabricBooti
 * A subtle, tileable Indian block-print "booti" texture, evoking unstitched suit
 * material. Renders as an absolutely-positioned background layer, so it sits behind
 * section content without affecting readability.
 *
 * Usage: place inside a `relative` section, before the content, e.g.
 *   <section className="relative ...">
 *     <FabricBooti opacity={0.05} motif="lotus" />
 *     <div className="relative z-10">...</div>
 *   </section>
 */
export function FabricBooti({
  className = "",
  opacity = 0.05,
  color = motifColors.primary,
  size = 150,
  motif = "flower",
}: FabricBootiProps) {
  const sprig = buildSprig(motif, color);

  const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140"><g fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(35,35)">${sprig}</g><g transform="translate(105,105)">${sprig}</g></g></svg>`;

  const backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(tile)}")`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage,
        backgroundSize: `${size}px ${size}px`,
        backgroundRepeat: "repeat",
        opacity,
      }}
    />
  );
}

function buildSprig(motif: BootiMotif, color: string): string {
  if (motif === "lotus") {
    // Layered line-art lotus: central heart-bud, flanking inner petals, middle
    // petals, and lance petals fanning outward.
    const almond = (L: number, W: number) =>
      `M0,0 C${W},${(-0.42 * L).toFixed(1)} ${W},${(-0.82 * L).toFixed(1)} 0,${-L} C${-W},${(-0.82 * L).toFixed(1)} ${-W},${(-0.42 * L).toFixed(1)} 0,0Z`;
    const rot = (p: string, d: number) => `<path d="${p}" transform="rotate(${d})"/>`;
    const outer = almond(21, 3.2);
    const mid = almond(18, 4.4);
    const inner = almond(16, 4);
    const bud =
      "M0,-19 C4.5,-13 5.5,-6 4.5,-2 C4,0.5 2,2 0.6,1.2 C0.2,2.2 -0.2,2.2 -0.6,1.2 C-2,2 -4,0.5 -4.5,-2 C-5.5,-6 -4.5,-13 0,-19Z";
    const petals =
      [-118, -92, -66, 66, 92, 118].map((d) => rot(outer, d)).join("") +
      [-46, -24, 24, 46].map((d) => rot(mid, d)).join("") +
      [-15, 15].map((d) => rot(inner, d)).join("") +
      `<path d="${bud}"/>` +
      rot(almond(7, 3), 180);
    // Nudge up so the bloom sits roughly centred in its tile cell.
    return `<g transform="translate(0,10)">${petals}</g>`;
  }

  if (motif === "peacock") {
    // Fine line-art peacock booti: head, crest, neck, body, fanned tail with eye spots
    return [
      `<circle cx="0" cy="-14" r="3"/>`,
      `<path d="M-1,-17 C-2,-20 -3,-22 -2,-23"/>`,
      `<path d="M0,-11 C0,-6 0,-1 3,2"/>`,
      `<ellipse cx="3" cy="7" rx="5" ry="7.5"/>`,
      `<path d="M6,2 C14,-2 18,-6 20,-11"/>`,
      `<path d="M7,7 C16,6 21,4 24,2"/>`,
      `<path d="M6,12 C14,15 18,18 20,22"/>`,
      `<circle cx="20" cy="-11" r="1.6" fill="${color}" stroke="none"/>`,
      `<circle cx="24" cy="2" r="1.6" fill="${color}" stroke="none"/>`,
      `<circle cx="20" cy="22" r="1.6" fill="${color}" stroke="none"/>`,
    ].join("");
  }

  // default "flower" — 6-petal block-print flower sprig with stem + two leaves
  const petal = "M0,-11 C4,-7 4,-2 0,0 C-4,-2 -4,-7 0,-11Z";
  return (
    `<g><path d="${petal}"/><path d="${petal}" transform="rotate(60)"/><path d="${petal}" transform="rotate(120)"/><path d="${petal}" transform="rotate(180)"/><path d="${petal}" transform="rotate(240)"/><path d="${petal}" transform="rotate(300)"/></g>` +
    `<circle cx="0" cy="0" r="2.2" fill="${color}" stroke="none"/>` +
    `<path d="M0,11 C0,17 0,20 0,24"/>` +
    `<path d="M0,17 C5,16 8,18 9,22 C4,22 1,21 0,17Z"/>` +
    `<path d="M0,20 C-5,19 -8,21 -9,25 C-4,25 -1,24 0,20Z"/>`
  );
}
