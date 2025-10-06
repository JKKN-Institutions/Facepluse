'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'premium' | 'subtle'
  hover?: boolean
  glow?: boolean
  glowColor?: 'emerald' | 'teal' | 'gold'
  animated?: boolean
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  hover = true,
  glow = false,
  glowColor = 'emerald',
  animated = true,
}: GlassCardProps) {

  const variantStyles = {
    default: cn(
      'bg-white/70 backdrop-blur-xl backdrop-saturate-180',
      'border-2 border-emerald-200/50',
      'shadow-[0_8px_32px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.1)]'
    ),
    elevated: cn(
      'bg-white/75 backdrop-blur-2xl backdrop-saturate-200',
      'border-2 border-emerald-300/60',
      'shadow-emerald-lg'
    ),
    premium: cn(
      'bg-gradient-to-br from-white/85 to-white/75',
      'backdrop-blur-2xl backdrop-saturate-200',
      'border-2 border-emerald-300/70',
      'shadow-emerald-xl',
      'before:absolute before:inset-[1px] before:rounded-[inherit]',
      'before:bg-gradient-to-br before:from-white/60 before:to-transparent',
      'before:pointer-events-none before:-z-10'
    ),
    subtle: cn(
      'bg-white/50 backdrop-blur-md backdrop-saturate-150',
      'border border-emerald-200/40',
      'shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
    ),
  }

  const glowStyles = glow ? {
    emerald: 'glow-emerald',
    teal: cn('shadow-[0_0_20px_rgba(20,184,166,0.4),0_0_40px_rgba(20,184,166,0.2)]'),
    gold: 'glow-gold',
  }[glowColor] : ''

  const hoverStyles = hover ? cn(
    'transition-all duration-300 ease-out',
    'hover:-translate-y-2 hover:scale-[1.01]',
    variant === 'premium'
      ? 'hover:shadow-emerald-xl hover:border-emerald-400/80'
      : 'hover:shadow-emerald-lg hover:border-emerald-300/70'
  ) : ''

  const baseStyles = cn(
    'relative rounded-3xl overflow-hidden',
    variantStyles[variant],
    glowStyles,
    hoverStyles,
    className
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={baseStyles}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseStyles}>
      {children}
    </div>
  )
}
