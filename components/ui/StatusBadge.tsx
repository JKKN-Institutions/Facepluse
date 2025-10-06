'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StatusBadgeProps {
  label: string
  color?: 'success' | 'warning' | 'error' | 'neutral'
  pulse?: boolean
}

export function StatusBadge({ label, color = 'neutral', pulse = false }: StatusBadgeProps) {
  const colorClasses = {
    success: 'bg-green-500/20 text-green-400 border-green-500/50',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    error: 'bg-red-500/20 text-red-400 border-red-500/50',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  }

  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border',
        colorClasses[color]
      )}
      animate={
        pulse
          ? {
              scale: [1, 1.05, 1],
              opacity: [1, 0.9, 1],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {pulse && (
        <span className={cn('w-2 h-2 rounded-full', {
          'bg-green-400': color === 'success',
          'bg-yellow-400': color === 'warning',
          'bg-red-400': color === 'error',
          'bg-gray-400': color === 'neutral',
        })} />
      )}
      {label}
    </motion.span>
  )
}
