'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useId } from 'react'

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  gradient?: 'green-emerald' | 'blue-green'
  children?: React.ReactNode
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 12,
  gradient = 'green-emerald',
  children,
}: ProgressRingProps) {
  const [mounted, setMounted] = useState(false)
  const id = useId()
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  useEffect(() => {
    setMounted(true)
  }, [])

  const gradientId = `gradient-${gradient}-${id}`
  const gradientColors =
    gradient === 'green-emerald'
      ? { start: '#10B981', end: '#059669' }
      : { start: '#3B82F6', end: '#10B981' }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.start} />
            <stop offset="100%" stopColor={gradientColors.end} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="rgba(255, 255, 255, 0.1)"
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={`url(#${gradientId})`}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: mounted ? offset : circumference }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
