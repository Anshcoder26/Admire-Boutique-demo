'use client';

import { motifOpacity, motifSize, motifColors } from './motif-utils';

interface FloralBelMotifProps {
  className?: string;
  opacity?: number;
  color?: string;
  variant?: 'horizontal' | 'corner' | 'short' | 'vertical';
  width?: string | number;
}

export function FloralBelMotif({
  className = '',
  opacity = motifOpacity.light,
  color = motifColors.currentColor,
  variant = 'horizontal',
  width = '100%',
}: FloralBelMotifProps) {
  if (variant === 'horizontal') {
    return (
      <div
        aria-hidden="true"
        className={`motif-floral-bel ${className}`}
        style={{
          width,
          height: '24px',
          opacity,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg
          viewBox="0 0 300 40"
          className="w-full h-full"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          preserveAspectRatio="none"
        >
          {/* Main vine/creeper line */}
          <path d="M 10 20 Q 35 10, 60 15 T 110 12 T 160 18 T 210 14 T 260 20 T 290 15" />

          {/* Flower blooms along the vine */}
          <circle cx="60" cy="15" r="5" />
          <circle cx="60" cy="10" r="2" opacity="0.6" />
          <circle cx="60" cy="20" r="2" opacity="0.6" />
          <circle cx="55" cy="15" r="2" opacity="0.6" />
          <circle cx="65" cy="15" r="2" opacity="0.6" />

          {/* Leaf clusters */}
          <path d="M 90 18 L 88 25 L 93 23 Z" opacity="0.7" />
          <path d="M 92 16 L 95 22 L 98 19 Z" opacity="0.7" />

          {/* Another bloom */}
          <circle cx="160" cy="18" r="5" />
          <circle cx="160" cy="23" r="2" opacity="0.6" />
          <circle cx="160" cy="13" r="2" opacity="0.6" />
          <circle cx="155" cy="18" r="2" opacity="0.6" />
          <circle cx="165" cy="18" r="2" opacity="0.6" />

          {/* Leaf clusters */}
          <path d="M 190 15 L 188 22 L 193 20 Z" opacity="0.7" />
          <path d="M 192 13 L 195 19 L 198 16 Z" opacity="0.7" />

          {/* Third bloom */}
          <circle cx="260" cy="20" r="4.5" />
          <circle cx="260" cy="25" r="2" opacity="0.6" />
          <circle cx="260" cy="15" r="2" opacity="0.6" />
          <circle cx="255" cy="20" r="2" opacity="0.6" />
          <circle cx="265" cy="20" r="2" opacity="0.6" />
        </svg>
      </div>
    );
  }

  if (variant === 'corner') {
    return (
      <div
        aria-hidden="true"
        className={`motif-floral-bel-corner ${className}`}
        style={{
          width: '80px',
          height: '80px',
          opacity,
        }}
      >
        <svg
          viewBox="0 0 80 80"
          className="w-full h-full"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* L-shaped vine for corner */}
          <path d="M 70 10 Q 60 15, 50 18 Q 40 22, 30 20 Q 20 18, 15 25" />

          {/* Blooms along corner vine */}
          <circle cx="50" cy="18" r="4" />
          <circle cx="50" cy="14" r="1.5" opacity="0.6" />
          <circle cx="50" cy="22" r="1.5" opacity="0.6" />
          <circle cx="46" cy="18" r="1.5" opacity="0.6" />
          <circle cx="54" cy="18" r="1.5" opacity="0.6" />

          {/* Leaves */}
          <path d="M 35 22 L 33 28 L 38 26 Z" opacity="0.7" />
          <path d="M 20 25 L 18 32 L 23 30 Z" opacity="0.7" />
        </svg>
      </div>
    );
  }

  if (variant === 'short') {
    return (
      <div
        aria-hidden="true"
        className={`motif-floral-bel-short ${className}`}
        style={{
          width: '120px',
          height: '20px',
          opacity,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg
          viewBox="0 0 120 30"
          className="w-full h-full"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          preserveAspectRatio="none"
        >
          {/* Short vine segment */}
          <path d="M 10 15 Q 30 8, 50 12 T 110 15" />

          {/* Single bloom */}
          <circle cx="50" cy="12" r="4" />
          <circle cx="50" cy="8" r="1.5" opacity="0.6" />
          <circle cx="50" cy="16" r="1.5" opacity="0.6" />
          <circle cx="46" cy="12" r="1.5" opacity="0.6" />
          <circle cx="54" cy="12" r="1.5" opacity="0.6" />

          {/* Leaf cluster */}
          <path d="M 75 13 L 73 19 L 78 17 Z" opacity="0.7" />
        </svg>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div
        aria-hidden="true"
        className={`motif-floral-bel-vertical ${className}`}
        style={{
          width: '30px',
          height: '120px',
          opacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 30 120"
          className="w-full h-full"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Vertical vine */}
          <path d="M 15 10 Q 10 30, 15 50 Q 20 70, 15 90 Q 10 110, 15 120" />

          {/* Blooms along vertical vine */}
          <circle cx="15" cy="50" r="4" />
          <circle cx="11" cy="50" r="1.5" opacity="0.6" />
          <circle cx="19" cy="50" r="1.5" opacity="0.6" />

          <circle cx="15" cy="85" r="4" />
          <circle cx="11" cy="85" r="1.5" opacity="0.6" />
          <circle cx="19" cy="85" r="1.5" opacity="0.6" />

          {/* Leaves */}
          <path d="M 12 35 L 8 40 L 12 43 Z" opacity="0.7" />
          <path d="M 18 65 L 22 68 L 18 72 Z" opacity="0.7" />
        </svg>
      </div>
    );
  }

  return null;
}

// Horizontal divider wrapper
export function FloralBelDivider({
  className = '',
  opacity = motifOpacity.light,
  color = motifColors.gold,
  spacing = 'my-8',
}: {
  className?: string;
  opacity?: number;
  color?: string;
  spacing?: string;
}) {
  return (
    <div className={`w-full flex justify-center ${spacing} ${className}`}>
      <FloralBelMotif
        variant="horizontal"
        opacity={opacity}
        color={color}
        width="90%"
      />
    </div>
  );
}

// Top border decoration
export function FloralBelTopBorder({
  className = '',
  opacity = motifOpacity.medium,
  color = motifColors.gold,
}: {
  className?: string;
  opacity?: number;
  color?: string;
}) {
  return (
    <div className={`w-full border-t border-[${color}]/30 pt-4 ${className}`}>
      <FloralBelMotif
        variant="short"
        opacity={opacity}
        color={color}
        width="80%"
      />
    </div>
  );
}
