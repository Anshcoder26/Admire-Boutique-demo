'use client';

import { motifOpacity, motifColors } from './motif-utils';

interface JaalPatternProps {
  className?: string;
  opacity?: number;
  color?: string;
  scale?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

/**
 * Jaal Pattern Component
 * Indian floral lattice/net pattern - very subtle, creates texture
 * Perfect for backgrounds behind text or as a decorative layer
 */
export function JaalPattern({
  className = '',
  opacity = motifOpacity.background,
  color = motifColors.secondary,
  scale = 'medium',
  children,
}: JaalPatternProps) {
  const patternId = `jaal-pattern-${Math.random().toString(36).substr(2, 9)}`;

  // Define scale for pattern
  const cellSize = {
    small: 40,
    medium: 60,
    large: 80,
  }[scale];

  return (
    <div
      className={`jaal-pattern relative ${className}`}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${cellSize}' height='${cellSize}' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='${patternId}' x='0' y='0' width='${cellSize}' height='${cellSize}' patternUnits='userSpaceOnUse'%3E%3C!-- Lattice lines --%3E%3Cline x1='0' y1='50' x2='100' y2='50' stroke='${encodeURIComponent(color)}' stroke-width='0.5' opacity='0.4'/%3E%3Cline x1='50' y1='0' x2='50' y2='100' stroke='${encodeURIComponent(color)}' stroke-width='0.5' opacity='0.4'/%3E%3Cline x1='0' y1='0' x2='100' y2='100' stroke='${encodeURIComponent(color)}' stroke-width='0.5' opacity='0.3'/%3E%3Cline x1='100' y1='0' x2='0' y2='100' stroke='${encodeURIComponent(color)}' stroke-width='0.5' opacity='0.3'/%3E%3C!-- Flower blooms at intersections --%3E%3Ccircle cx='50' cy='50' r='3' fill='${encodeURIComponent(color)}' opacity='0.5'/%3E%3Ccircle cx='0' cy='0' r='2' fill='${encodeURIComponent(color)}' opacity='0.3'/%3E%3Ccircle cx='100' cy='0' r='2' fill='${encodeURIComponent(color)}' opacity='0.3'/%3E%3Ccircle cx='0' cy='100' r='2' fill='${encodeURIComponent(color)}' opacity='0.3'/%3E%3Ccircle cx='100' cy='100' r='2' fill='${encodeURIComponent(color)}' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23${patternId})'/%3E%3C/svg%3E")`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * SVG-based Jaal pattern for more control
 */
export function JaalPatternSVG({
  className = '',
  opacity = motifOpacity.background,
  color = motifColors.secondary,
  scale = 'medium',
  width = '100%',
  height = '300px',
}: {
  className?: string;
  opacity?: number;
  color?: string;
  scale?: 'small' | 'medium' | 'large';
  width?: string;
  height?: string;
}) {
  const cellSize = {
    small: 40,
    medium: 60,
    large: 80,
  }[scale];

  const patternId = `jaal-svg-${Math.random().toString(36).substr(2, 9)}`;
  const cells = Math.ceil(200 / cellSize) + 1;

  return (
    <div
      aria-hidden="true"
      className={`jaal-pattern-svg ${className}`}
      style={{ opacity }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${cellSize * cells} ${cellSize * cells}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={cellSize}
            height={cellSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Lattice lines - creating net/jaal effect */}
            <line
              x1="0"
              y1={cellSize / 2}
              x2={cellSize}
              y2={cellSize / 2}
              stroke={color}
              strokeWidth="0.5"
              opacity="0.4"
            />
            <line
              x1={cellSize / 2}
              y1="0"
              x2={cellSize / 2}
              y2={cellSize}
              stroke={color}
              strokeWidth="0.5"
              opacity="0.4"
            />

            {/* Diagonal lines for pattern depth */}
            <line
              x1="0"
              y1="0"
              x2={cellSize}
              y2={cellSize}
              stroke={color}
              strokeWidth="0.5"
              opacity="0.3"
            />
            <line
              x1={cellSize}
              y1="0"
              x2="0"
              y2={cellSize}
              stroke={color}
              strokeWidth="0.5"
              opacity="0.3"
            />

            {/* Floral elements at intersections */}
            {/* Center */}
            <circle
              cx={cellSize / 2}
              cy={cellSize / 2}
              r="3"
              fill={color}
              opacity="0.5"
            />
            {/* Corners */}
            <circle cx="0" cy="0" r="2" fill={color} opacity="0.3" />
            <circle cx={cellSize} cy="0" r="2" fill={color} opacity="0.3" />
            <circle cx="0" cy={cellSize} r="2" fill={color} opacity="0.3" />
            <circle cx={cellSize} cy={cellSize} r="2" fill={color} opacity="0.3" />

            {/* Small leaf accents */}
            <path
              d={`M ${cellSize / 2} ${cellSize / 4} L ${(cellSize / 2) - 2} ${(cellSize / 4) + 3} L ${(cellSize / 2) + 2} ${(cellSize / 4) + 3} Z`}
              fill={color}
              opacity="0.3"
            />
          </pattern>
        </defs>

        {/* Fill entire area with jaal pattern */}
        <rect
          width={cellSize * cells}
          height={cellSize * cells}
          fill={`url(#${patternId})`}
        />
      </svg>
    </div>
  );
}

/**
 * Jaal background container
 * Common use case: wrapping sections with subtle patterned background
 */
export function JaalBackgroundContainer({
  children,
  className = '',
  opacity = motifOpacity.background,
  color = motifColors.secondary,
  scale = 'medium',
}: {
  children: React.ReactNode;
  className?: string;
  opacity?: number;
  color?: string;
  scale?: 'small' | 'medium' | 'large';
}) {
  return (
    <JaalPattern
      opacity={opacity}
      color={color}
      scale={scale}
      className={className}
    >
      {children}
    </JaalPattern>
  );
}

/**
 * CSS Class Helper - Apply jaal pattern via class
 * Usage: Add class "jaal-pattern-light" or "jaal-pattern-medium" to any div
 */
export function useJaalPatternClass(
  intensity: 'light' | 'medium' = 'light'
): string {
  return intensity === 'light' ? 'jaal-pattern-light' : 'jaal-pattern-medium';
}
