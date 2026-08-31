'use client';

import { motifOpacity, motifSize, motifColors } from './motif-utils';

interface PaisleyMotifProps {
  className?: string;
  opacity?: number;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline'; // filled = solid, outline = stroke only
}

export function PaisleyMotif({
  className = '',
  opacity = motifOpacity.light,
  color = motifColors.currentColor,
  size = 'md',
  variant = 'outline',
}: PaisleyMotifProps) {
  const sizeValue = motifSize[size];
  const viewBoxSize = size === 'xs' ? 40 : size === 'sm' ? 50 : size === 'md' ? 60 : 70;

  return (
    <div
      aria-hidden="true"
      className={`motif-paisley ${className}`}
      style={{
        width: sizeValue,
        height: sizeValue,
        opacity,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-full"
        fill={variant === 'filled' ? color : 'none'}
        stroke={variant === 'outline' ? color : 'none'}
        strokeWidth={variant === 'outline' ? '1.5' : '0'}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Paisley drop shape - traditional textile buta */}
        {/* Outer teardrop */}
        <path d="M 50 15 Q 35 25 35 40 Q 35 55 50 60 Q 65 55 65 40 Q 65 25 50 15 Z" />

        {/* Inner curve detail */}
        <path d="M 50 22 Q 42 28 42 40 Q 42 50 50 54 Q 58 50 58 40 Q 58 28 50 22 Z" opacity="0.6" />

        {/* Small decorative leaf/petal on side (traditional buta element) */}
        <path d="M 58 32 Q 68 28 72 35 Q 68 42 58 40 Z" />

        {/* Center dot */}
        <circle cx="50" cy="40" r="3" />

        {/* Small decorative flowers around paisley for textile effect */}
        <circle cx="30" cy="20" r="2" opacity="0.5" />
        <circle cx="70" cy="30" r="2" opacity="0.5" />
      </svg>
    </div>
  );
}

// Paisley with text label - useful for section headings
interface PaisleyLabelProps {
  text: string;
  className?: string;
  position?: 'left' | 'right';
}

export function PaisleyLabel({
  text,
  className = '',
  position = 'left',
}: PaisleyLabelProps) {
  const paisley = (
    <PaisleyMotif
      size="sm"
      opacity={motifOpacity.light}
      color={motifColors.currentColor}
      variant="outline"
    />
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {position === 'left' && paisley}
      <span className="text-sm tracking-wider uppercase font-medium">{text}</span>
      {position === 'right' && paisley}
    </div>
  );
}

// Multiple paisley divider line
export function PaisleyDivider({
  count = 3,
  className = '',
  opacity = motifOpacity.light,
}: {
  count?: number;
  className?: string;
  opacity?: number;
}) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <PaisleyMotif key={i} size="sm" opacity={opacity} color={motifColors.gold} />
      ))}
    </div>
  );
}
