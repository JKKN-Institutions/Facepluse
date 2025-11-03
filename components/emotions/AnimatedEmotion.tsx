'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles, Zap, Cloud, Star } from 'lucide-react'

interface AnimatedEmotionProps {
  emotion: string
  confidence: number
}

// Emotion configurations
const emotionConfig = {
  happy: {
    emoji: '😊',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    particles: '✨🌟💚',
    icon: Sparkles,
    bounce: true,
  },
  sad: {
    emoji: '😢',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    particles: '💧😔🌧️',
    icon: Cloud,
    bounce: false,
  },
  surprised: {
    emoji: '😲',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'from-yellow-50 to-orange-50',
    particles: '⚡✨🎆',
    icon: Zap,
    bounce: true,
  },
  neutral: {
    emoji: '😐',
    color: 'from-gray-400 to-gray-500',
    bgColor: 'from-gray-50 to-gray-100',
    particles: '•••',
    icon: Star,
    bounce: false,
  },
  angry: {
    emoji: '😠',
    color: 'from-red-400 to-red-600',
    bgColor: 'from-red-50 to-red-100',
    particles: '💢🔥😤',
    icon: Zap,
    bounce: true,
  },
}

export function AnimatedEmotion({ emotion, confidence }: AnimatedEmotionProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; char: string }>>([])
  const config = emotionConfig[emotion.toLowerCase() as keyof typeof emotionConfig] || emotionConfig.neutral
  const Icon = config.icon

  // Generate particles on emotion change (reduced for mobile)
  useEffect(() => {
    if (confidence > 50) {
      // Reduce particles on mobile for better performance
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
      const particleCount = isMobile ? 3 : 8

      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        char: config.particles[Math.floor(Math.random() * config.particles.length)],
      }))
      setParticles(newParticles)

      setTimeout(() => setParticles([]), 2000)
    }
  }, [emotion, confidence, config.particles])

  // Get border color dynamically
  const getBorderColor = () => {
    const borderMap = {
      happy: 'border-emerald-300/50',
      sad: 'border-blue-300/50',
      surprised: 'border-yellow-300/50',
      neutral: 'border-gray-300/50',
      angry: 'border-red-300/50',
    }
    return borderMap[emotion.toLowerCase() as keyof typeof borderMap] || 'border-gray-300/50'
  }

  return (
    <div className={`relative bg-gradient-to-br ${config.bgColor} glass-default rounded-2xl md:rounded-3xl ${getBorderColor()} p-3 md:p-4 overflow-hidden group hover:-translate-y-1 md:hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300`}>
      {/* Background Glow Animation */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-10`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Particles - Responsive */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0
            }}
            animate={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 1.5,
              rotate: 360
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              ease: "easeOut"
            }}
            className="absolute top-1/2 left-1/2 text-base md:text-xl pointer-events-none"
          >
            {particle.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Centered Layout */}
      <div className="relative text-center">
        {/* Premium Badge - Top Right - Responsive */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`absolute -top-1 -right-1 inline-flex items-center gap-0.5 md:gap-1 bg-gradient-to-r ${config.color} px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full shadow-md z-10`}
        >
          <Icon className="w-2 h-2 md:w-2.5 md:h-2.5 text-white" />
          <span className="text-[8px] md:text-[9px] font-bold text-white uppercase tracking-wider">Emotion</span>
        </motion.div>

        {/* Large Emoji with Glow - Responsive */}
        <div className="relative mx-auto w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-1.5 md:mb-2">
          <motion.div
            key={emotion}
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: 1,
              rotate: 0,
              ...(config.bounce && {
                y: [0, -8, 0],
              })
            }}
            transition={{
              scale: { type: "spring", stiffness: 200, damping: 10 },
              rotate: { duration: 0.5 },
              y: {
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut"
              }
            }}
            className="relative"
          >
            <span className="text-4xl md:text-5xl drop-shadow-2xl">{config.emoji}</span>

            {/* Strong Emoji Glow */}
            {confidence > 70 && (
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${config.color} rounded-full blur-xl md:blur-2xl opacity-40`}
                animate={{
                  scale: [1, 1.4, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Emotion Name - Responsive */}
        <motion.h3
          key={emotion}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl font-bold text-gray-800 capitalize mb-1 md:mb-1.5 tracking-tight"
        >
          {emotion}
        </motion.h3>

        {/* Premium Confidence Bar - Responsive */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="flex-1 bg-white/60 rounded-full h-1.5 md:h-2 overflow-hidden backdrop-blur-sm border border-white/80 shadow-inner">
              <motion.div
                className={`h-full bg-gradient-to-r ${config.color} rounded-full relative overflow-hidden`}
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Shimmer */}
                {confidence > 0 && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}
              </motion.div>
            </div>
            <motion.span
              key={confidence}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-[10px] md:text-xs font-bold text-gray-700 min-w-[38px] md:min-w-[50px]"
            >
              {confidence}%
            </motion.span>
          </div>
        </div>
      </div>

      {/* Pulsing Ring for High Confidence - Responsive */}
      {confidence > 80 && (
        <motion.div
          className={`absolute inset-0 border-2 md:border-4 border-gradient-to-r ${config.color} rounded-2xl md:rounded-xl`}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
    </div>
  )
}
