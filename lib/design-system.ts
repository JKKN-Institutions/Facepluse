// Premium Design System for FacePulse
// Professional color palette, typography, spacing, and effects

export const premiumColors = {
  // Primary Brand Colors
  brand: {
    emerald: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    teal: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
    }
  },

  // Accent Colors for Rankings
  accent: {
    gold: {
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    silver: {
      300: '#E2E8F0',
      400: '#CBD5E1',
      500: '#94A3B8',
      600: '#64748B',
      700: '#475569',
    },
    bronze: {
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',
      600: '#EA580C',
      700: '#C2410C',
    }
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    neutral: '#6B7280',
  },

  // Glass Materials
  glass: {
    white: 'rgba(255, 255, 255, 0.7)',
    whiteHover: 'rgba(255, 255, 255, 0.85)',
    whitePremium: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(0, 0, 0, 0.05)',
    border: 'rgba(16, 185, 129, 0.2)',
    borderHover: 'rgba(16, 185, 129, 0.4)',
  }
}

// Premium Gradient Presets
export const premiumGradients = {
  // Single direction gradients
  emerald: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
  teal: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0F766E 100%)',
  emeraldTeal: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',

  // Multi-stop gradients for depth
  emeraldDepth: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 25%, #34D399 50%, #10B981 75%, #047857 100%)',
  tealDepth: 'linear-gradient(135deg, #F0FDFA 0%, #99F6E4 25%, #2DD4BF 50%, #14B8A6 75%, #0F766E 100%)',

  // Ambient backgrounds
  ambientEmerald: 'linear-gradient(135deg, #F0FDFA 0%, #ECFDF5 50%, #D1FAE5 100%)',
  ambientWhite: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 50%, #F3F4F6 100%)',

  // Rank gradients
  gold: 'linear-gradient(135deg, #FCD34D 0%, #FBBF24 50%, #F59E0B 100%)',
  silver: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 50%, #94A3B8 100%)',
  bronze: 'linear-gradient(135deg, #FDBA74 0%, #FB923C 50%, #F97316 100%)',

  // Emotion-specific
  happy: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  sad: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  surprised: 'linear-gradient(135deg, #FBBF24 0%, #FB923C 100%)',
  neutral: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
  angry: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
}

// Typography System
export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), system-ui, -apple-system, sans-serif',
    display: 'var(--font-inter), system-ui, -apple-system, sans-serif',
  },

  fontSize: {
    // Display sizes (headers, hero text)
    display: {
      xl: 'clamp(4rem, 8vw, 6rem)',      // 64px - 96px
      lg: 'clamp(3rem, 6vw, 4.5rem)',    // 48px - 72px
      md: 'clamp(2.5rem, 5vw, 3.5rem)',  // 40px - 56px
      sm: 'clamp(2rem, 4vw, 2.5rem)',    // 32px - 40px
    },

    // Metric sizes (numbers, percentages)
    metric: {
      hero: '5rem',      // 80px - main metrics
      xl: '4rem',        // 64px
      lg: '3.5rem',      // 56px
      md: '2.5rem',      // 40px
      sm: '1.5rem',      // 24px
    },

    // Body text
    body: {
      xl: '1.25rem',     // 20px
      lg: '1.125rem',    // 18px
      md: '1rem',        // 16px
      sm: '0.875rem',    // 14px
      xs: '0.75rem',     // 12px
      xxs: '0.625rem',   // 10px
    }
  },

  fontWeight: {
    thin: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
    heavy: 900,
  },

  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.05em',
    widest: '0.1em',
  }
}

// Spacing System (8px grid)
export const spacing = {
  // Base unit
  unit: 8,

  // Scale
  scale: {
    0: '0',
    1: '0.5rem',    // 8px
    2: '1rem',      // 16px
    3: '1.5rem',    // 24px
    4: '2rem',      // 32px
    5: '2.5rem',    // 40px
    6: '3rem',      // 48px
    8: '4rem',      // 64px
    10: '5rem',     // 80px
    12: '6rem',     // 96px
    16: '8rem',     // 128px
  },

  // Component presets
  card: {
    paddingSmall: '1.5rem',    // 24px
    padding: '2rem',           // 32px
    paddingLarge: '2.5rem',    // 40px
    gap: '1.5rem',             // 24px
    gapSmall: '1rem',          // 16px
  },

  section: {
    gap: '2rem',               // 32px
    gapLarge: '3rem',          // 48px
  }
}

// Shadow System (Premium depth)
export const shadows = {
  // Neutral shadows (elevation)
  sm: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.1)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.12)',
  '2xl': '0 24px 64px rgba(0, 0, 0, 0.12), 0 12px 24px rgba(0, 0, 0, 0.14)',

  // Colored shadows (premium feel)
  emerald: {
    sm: '0 2px 8px rgba(16, 185, 129, 0.1), 0 1px 2px rgba(16, 185, 129, 0.15)',
    md: '0 4px 16px rgba(16, 185, 129, 0.15), 0 2px 4px rgba(16, 185, 129, 0.2)',
    lg: '0 8px 32px rgba(16, 185, 129, 0.2), 0 4px 8px rgba(16, 185, 129, 0.25)',
    xl: '0 16px 48px rgba(16, 185, 129, 0.25), 0 8px 16px rgba(16, 185, 129, 0.3)',
  },

  teal: {
    md: '0 4px 16px rgba(20, 184, 166, 0.15), 0 2px 4px rgba(20, 184, 166, 0.2)',
    lg: '0 8px 32px rgba(20, 184, 166, 0.2), 0 4px 8px rgba(20, 184, 166, 0.25)',
  },

  gold: {
    md: '0 4px 16px rgba(251, 191, 36, 0.2), 0 2px 4px rgba(251, 191, 36, 0.3)',
    lg: '0 8px 32px rgba(251, 191, 36, 0.25), 0 4px 8px rgba(251, 191, 36, 0.35)',
    xl: '0 12px 40px rgba(251, 191, 36, 0.4), 0 6px 12px rgba(251, 191, 36, 0.5)',
  },

  silver: {
    md: '0 4px 16px rgba(148, 163, 184, 0.2), 0 2px 4px rgba(148, 163, 184, 0.3)',
    lg: '0 8px 32px rgba(148, 163, 184, 0.25), 0 4px 8px rgba(148, 163, 184, 0.35)',
  },

  bronze: {
    md: '0 4px 16px rgba(251, 146, 60, 0.2), 0 2px 4px rgba(251, 146, 60, 0.3)',
    lg: '0 8px 32px rgba(251, 146, 60, 0.25), 0 4px 8px rgba(251, 146, 60, 0.35)',
  },

  // Inner shadows (depth)
  inner: {
    sm: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    md: 'inset 0 4px 8px rgba(0, 0, 0, 0.08)',
    lg: 'inset 0 8px 16px rgba(0, 0, 0, 0.1)',
  },

  // Glow effects
  glow: {
    emerald: '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
    emeraldStrong: '0 0 30px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.3)',
    teal: '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)',
    gold: '0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3)',
  }
}

// Border Radius System
export const borderRadius = {
  none: '0',
  sm: '0.5rem',      // 8px
  md: '0.75rem',     // 12px
  lg: '1rem',        // 16px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px
  full: '9999px',

  // Component presets
  card: '1.5rem',           // 24px - metric cards
  cardLarge: '2rem',        // 32px - large containers
  button: '0.75rem',        // 12px - buttons
  badge: '9999px',          // full - pills/badges
  input: '0.75rem',         // 12px - inputs
}

// Animation Timings
export const animations = {
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    medium: '500ms',
    slow: '800ms',
    slower: '1000ms',
    slowest: '1500ms',
  },

  easing: {
    // Default
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Premium easings
    premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

    // Specific use cases
    lift: 'cubic-bezier(0.2, 0, 0, 1)',
    drop: 'cubic-bezier(1, 0, 0.8, 0)',
  }
}

// Utility functions for generating styles
export const generateGlassStyle = (variant: 'default' | 'premium' | 'subtle' = 'default') => {
  const variants = {
    default: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(24px) saturate(180%)',
      border: '2px solid rgba(16, 185, 129, 0.2)',
    },
    premium: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.7) 100%)',
      backdropFilter: 'blur(32px) saturate(200%)',
      border: '2px solid rgba(16, 185, 129, 0.3)',
    },
    subtle: {
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(16px) saturate(150%)',
      border: '1px solid rgba(16, 185, 129, 0.15)',
    }
  }

  return variants[variant]
}
