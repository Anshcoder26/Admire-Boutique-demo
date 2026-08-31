'use client';

import { motifOpacity, motifColors } from './motif-utils';

interface BootiPatternProps {
  className?: string;
  opacity?: number;
  color?: string;
  density?: 'loose' | 'medium' | 'dense';
  children?: React.ReactNode;
}

/**
 * Booti Pattern Component
 * Creates a repeating textile-inspired booti pattern as background
 * Can be used as a background layer or container with children
 */
export function BootiPattern({
  className = '',
  opacity = motifOpacity.background,
  color = motifColors.secondary,
  density = 'medium',
  children,
}: BootiPatternProps) {
  const patternId = `booti-pattern-${Math.random().toString(36).substr(2, 9)}`;

  // Define spacing based on density
  const spacing = {
    loose: 80,
    medium: 60,
    dense: 40,
  }[density];

  return (
    <div
      className={`booti-pattern relative ${className}`}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${spacing}' height='${spacing}' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='${patternId}' x='0' y='0' width='${spacing}' height='${spacing}' patternUnits='userSpaceOnUse'%3E%3Cg fill='${encodeURIComponent(color)}' opacity='0.5'%3E%3C!-- Small floral booti motif --%3E%3Ccircle cx='50' cy='50' r='8'/%3E%3Ccircle cx='50' cy='35' r='4' opacity='0.7'/%3E%3Ccircle cx='50' cy='65' r='4' opacity='0.7'/%3E%3Ccircle cx='35' cy='50' r='4' opacity='0.7'/%3E%3Ccircle cx='65' cy='50' r='4' opacity='0.7'/%3E%3Ccircle cx='40' cy='40' r='2' opacity='0.5'/%3E%3Ccircle cx='60' cy='40' r='2' opacity='0.5'/%3E%3Ccircle cx='40' cy='60' r='2' opacity='0.5'/%3E%3Ccircle cx='60' cy='60' r='2' opacity='0.5'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23${patternId})'/%3E%3C/svg%3E")`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Alternative implementation using SVG pattern element
 * For cases where you want more control over the pattern
 */
export function BootiPatternSVG({
  className = '',
  opacity = motifOpacity.background,
  color = motifColors.secondary,
  density = 'medium',
  width = '100%',
  height = '200px',
}: {
  className?: string;
  opacity?: number;
  color?: string;
  density?: 'loose' | 'medium' | 'dense';
  width?: string;
  height?: string;
}) {
  const spacing = {
    loose: 80,
    medium: 60,
    dense: 40,
  }[density];

  const patternId = `booti-svg-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      aria-hidden="true"
      className={`booti-pattern-svg ${className}`}
      style={{ opacity }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${spacing * 3} ${spacing * 3}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            {/* Small floral booti - flower with petals */}
            <circle cx={spacing / 2} cy={spacing / 2} r="8" fill={color} opacity="0.5" />
            <circle cx={spacing / 2} cy={(spacing / 2) - 14} r="4" fill={color} opacity="0.4" />
            <circle cx={spacing / 2} cy={(spacing / 2) + 14} r="4" fill={color} opacity="0.4" />
            <circle cx={(spacing / 2) - 14} cy={spacing / 2} r="4" fill={color} opacity="0.4" />
            <circle cx={(spacing / 2) + 14} cy={spacing / 2} r="4" fill={color} opacity="0.4" />

            {/* Small decorative dots */}
            <circle cx={(spacing / 2) - 10} cy={(spacing / 2) - 10} r="2" fill={color} opacity="0.3" />
            <circle cx={(spacing / 2) + 10} cy={(spacing / 2) - 10} r="2" fill={color} opacity="0.3" />
            <circle cx={(spacing / 2) - 10} cy={(spacing / 2) + 10} r="2" fill={color} opacity="0.3" />
            <circle cx={(spacing / 2) + 10} cy={(spacing / 2) + 10} r="2" fill={color} opacity="0.3" />
          </pattern>
        </defs>

        {/* Fill entire area with pattern */}
        <rect width={spacing * 3} height={spacing * 3} fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

/**
 * CSS Class Helper - Apply booti pattern to any element
 * Usage: Add class "booti-pattern-light" or "booti-pattern-medium" to any div
 */
export function useBootiPatternClass(
  density: 'light' | 'medium' = 'light'
): string {
  return density === 'light' ? 'booti-pattern-light' : 'booti-pattern-medium';
}

/**
 * Container with booti background - common use case
 */
export function BootiBackgroundContainer({
  children,
  className = '',
  opacity = motifOpacity.background,
  color = motifColors.secondary,
  density = 'medium',
  variant = 'pattern',
}: {
  children: React.ReactNode;
  className?: string;
  opacity?: number;
  color?: string;
  density?: 'loose' | 'medium' | 'dense';
  variant?: 'pattern' | 'solid';
}) {
  if (variant === 'solid') {
    // Simple colored background
    return (
      <div
        className={`relative ${className}`}
        style={{
          backgroundColor: color,
          opacity,
        }}
      >
        {children}
      </div>
    );
  }

  // Pattern background
  return (
    <BootiPattern
      opacity={opacity}
      color={color}
      density={density}
      className={className}
    >
      {children}
    </BootiPattern>
  );
}
