export type MotifTileName = "lotus" | "peacock";

const SRC: Record<MotifTileName, string> = {
  lotus: "/motifs/lotus-emblem.png",
  peacock: "/motifs/peacock.png",
};

interface MotifTileProps {
  /** Which designer motif to tile. */
  motif?: MotifTileName;
  className?: string;
  /** Final visible opacity of the tiled layer (keep low: 0.08–0.2). */
  opacity?: number;
  /** Optional lighter opacity applied on small (mobile) screens. Defaults to `opacity`. */
  mobileOpacity?: number;
  /** Tile size in px. Larger = more spaced out. */
  size?: number;
}

/**
 * MotifTile
 * A subtle, tileable background layer built from the designer's hand-painted
 * artwork (transparent PNGs). Unlike FabricBooti (line-art SVG), this uses the
 * real watercolour motif, so it reads as the boutique's own lotus across light
 * and dark (maroon) sections. Reuses the `.fabric-booti` opacity rule in
 * globals.css for a lighter treatment on mobile.
 *
 * Usage: place inside a `relative` container, before the content, e.g.
 *   <section className="relative ...">
 *     <MotifTile motif="lotus" opacity={0.14} />
 *     <div className="relative z-10">...</div>
 *   </section>
 */
export function MotifTile({
  motif = "lotus",
  className = "",
  opacity = 0.14,
  mobileOpacity,
  size = 160,
}: MotifTileProps) {
  const mOpacity = mobileOpacity ?? opacity;

  return (
    <div
      aria-hidden="true"
      className={`fabric-booti pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `url("${SRC[motif]}")`,
        backgroundSize: `${size}px ${size}px`,
        backgroundRepeat: "repeat",
        ["--fb-op" as string]: `${mOpacity}`,
        ["--fb-op-md" as string]: `${opacity}`,
      }}
    />
  );
}
