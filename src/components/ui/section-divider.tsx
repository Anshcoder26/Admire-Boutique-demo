'use client';

import { FloralBelMotif } from '../motifs/floral-bel-motif';
import { motifOpacity, motifColors } from '../motifs/motif-utils';

interface SectionDividerProps {
  className?: string;
  opacity?: number;
  color?: string;
  variant?: 'floral' | 'plain' | 'dotted';
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable Section Divider Component
 * Replaces generic <hr/> elements with elegant motif-based dividers
 * Used to separate major sections on pages
 */
export function SectionDivider({
  className = '',
  opacity = motifOpacity.prominent,
  color = motifColors.gold,
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
        <div style={{ height: '60px', width: '80%' }}>
          <FloralBelMotif
            variant="horizontal"
            opacity={opacity}
            color={color}
            width="100%"
          />
        </div>
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
        borderOpacity,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
}
