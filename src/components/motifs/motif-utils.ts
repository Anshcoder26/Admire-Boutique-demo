// Motif system utilities for Admire Boutique
// Centralized configuration for motif sizes, opacities, and colors

export const motifOpacity = {
  background: 0.03,      // 3% - Very subtle background texture
  backgroundMedium: 0.05, // 5% - Slightly more visible background
  subtle: 0.08,           // 8% - Minimum visible accent
  light: 0.15,            // 15% - Light decorative element
  medium: 0.25,           // 25% - Medium visibility
  prominent: 0.4,         // 40% - Prominent decoration
  full: 1,                // 100% - Statement piece (Peacock, etc.)
};

export const motifSize = {
  xs: '16px',   // Tiny accents (16x16)
  sm: '24px',   // Small decorations (24x24)
  md: '32px',   // Medium (32x32)
  lg: '48px',   // Large (48x48)
  xl: '64px',   // Extra large (64x64)
  xxl: '96px',  // Statement size (96x96)
  full: '100%', // Full width/height
};

// Standard color definitions - ONLY use existing brand colors
export const motifColors = {
  gold: '#D4AF37',
  primary: '#7D1D1D',
  secondary: '#8b6b47',
  cream: '#fef9f5',
  text: '#1a1612',
  saffron: '#c96f54',
  emerald: '#1ba098',
  currentColor: 'currentColor',
};

// Responsive breakpoints for hiding motifs on mobile
export const motifBreakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
};

// Animation durations (in seconds)
export const animationDurations = {
  slow: '12s',
  normal: '8s',
  fast: '4s',
};

// Helper to generate opacity CSS
export const getOpacityCss = (opacity: number): string => {
  return `opacity: ${opacity};`;
};

// Helper to generate size CSS
export const getSizeCss = (size: string): string => {
  return `width: ${size}; height: ${size};`;
};
