'use client';

import { motifOpacity, motifColors } from '../motifs/motif-utils';

interface SectionDividerProps {
  className?: string;
  opacity?: number;
  color?: string;
  variant?: 'floral' | 'plain' | 'dotted';
  spacing?: 'sm' | 'md' | 'lg';
}

/** Builds the layered line-art lotus used at the centre of the divider. */
function lotusPaths(): string {
  const almond = (L: number, W: number) =>
    `M0,0 C${W},${(-0.42 * L).toFixed(1)} ${W},${(-0.82 * L).toFixed(1)} 0,${-L} C${-W},${(-0.82 * L).toFixed(1)} ${-W},${(-0.42 * L).toFixed(1)} 0,0Z`;
  const rot = (p: string, d: number) => `<path d="${p}" transform="rotate(${d})"/>`;
  const outer = almond(21, 3.2);
  const mid = almond(18, 4.4);
  const inner = almond(16, 4);
  const bud =
    'M0,-19 C4.5,-13 5.5,-6 4.5,-2 C4,0.5 2,2 0.6,1.2 C0.2,2.2 -0.2,2.2 -0.6,1.2 C-2,2 -4,0.5 -4.5,-2 C-5.5,-6 -4.5,-13 0,-19Z';
  return (
    [-118, -92, -66, 66, 92, 118].map((d) => rot(outer, d)).join('') +
    [-46, -24, 24, 46].map((d) => rot(mid, d)).join('') +
    [-15, 15].map((d) => rot(inner, d)).join('') +
    `<path d="${bud}"/>` +
    rot(almond(7, 3), 180)
  );
}

/** Builds one horizontal ornamental arm (rule + wave arcs + diamond end cap). */
function dividerArm(dir: 1 | -1, color: string): string {
  const line = `<line x1="0" y1="0" x2="${dir * 150}" y2="0"/>`;
  const cx = dir * 14;
  const arcs = [5, 9, 13]
    .map((r) => `<path d="M${cx - r},0 A${r},${r} 0 0 1 ${cx + r},0"/>`)
    .join('');
  const dx = dir * 150;
  const cap = `<path d="M${dx},-3 L${dx + dir * 3},0 L${dx},3 L${dx - dir * 3},0 Z" fill="${color}" stroke="none"/>`;
  return line + arcs + cap;
}

/** Full lotus divider SVG as a data-URI (responsive, recolourable). */
function lotusDividerUri(color: string): string {
  const W = 440;
  const H = 80;
  const midx = W / 2;
  const y = 52;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<g fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">` +
    `<g transform="translate(${midx - 34},${y})">${dividerArm(-1, color)}</g>` +
    `<g transform="translate(${midx + 34},${y})">${dividerArm(1, color)}</g>` +
    `<g transform="translate(${midx},${y})">${lotusPaths()}</g>` +
    `</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Reusable Section Divider Component
 * Replaces generic <hr/> elements with elegant motif-based dividers
 * Used to separate major sections on pages
 */
export function SectionDivider({
  className = '',
  opacity = 0.7,
  color = motifColors.primary,
  variant = 'floral',
  spacing = 'md',
}: SectionDividerProps) {
  const spacingClass = {
    sm: 'my-6',
    md: 'my-8',
    lg: 'my-12',
  }[spacing];

  if (variant === 'floral') {
    return (
      <div className={`w-full flex justify-center ${spacingClass} ${className}`}>
        <img
          src={lotusDividerUri(color)}
          alt=""
          aria-hidden="true"
          className="h-auto w-[280px] max-w-[80%] sm:w-[380px]"
          style={{ opacity }}
        />
      </div>
    );
  }

  if (variant === 'dotted') {
    return (
      <div className={`w-full flex justify-center items-center gap-4 ${spacingClass} ${className}`}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
        <div className="flex gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: color,
              opacity,
            }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: color,
              opacity,
            }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: color,
              opacity,
            }}
          />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      </div>
    );
  }

  // Plain divider
  return (
    <div
      className={`w-full ${spacingClass} ${className}`}
      style={{
        borderTop: `1px solid ${color}`,
        opacity,
      }}
    />
  );
}

/**
 * Full-width section divider with background
 */
export function DividerSection({
  children,
  className = '',
  backgroundColor = 'transparent',
  dividerColor = motifColors.gold,
  dividerOpacity = motifOpacity.light,
}: {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  dividerColor?: string;
  dividerOpacity?: number;
}) {
  return (
    <div
      className={`w-full ${className}`}
      style={{
        backgroundColor,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SectionDivider
          color={dividerColor}
          opacity={dividerOpacity}
          variant="floral"
        />
        {children}
      </div>
    </div>
  );
}

/**
 * Top and bottom bordered section
 */
export function BorderedSection({
  children,
  className = '',
  borderColor = motifColors.gold,
  borderOpacity = motifOpacity.light,
}: {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  borderOpacity?: number;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        borderTop: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`,
        opacity: borderOpacity,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
}
