'use client'

import { motion } from 'framer-motion'
import { Smile, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AnimatedSmileCard({ percentage }: { percentage: number }) {
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (percentage >= 90) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }, [percentage])

  const getEmoji = () => {
    if (percentage >= 80) return '😁'
    if (percentage >= 60) return '😊'
    if (percentage >= 40) return '🙂'
    if (percentage >= 20) return '😐'
    return '😔'
  }

  const getGradient = () => {
    if (percentage >= 80) return 'from-emerald-400 via-emerald-500 to-teal-500'
    if (percentage >= 60) return 'from-emerald-300 via-emerald-400 to-emerald-500'
    if (percentage >= 40) return 'from-yellow-400 via-green-400 to-emerald-400'
    return 'from-gray-400 to-gray-500'
  }

  const getIconGradient = () => {
    if (percentage >= 80) return 'from-emerald-400 via-emerald-500 to-emerald-600'
    if (percentage >= 60) return 'from-emerald-300 via-emerald-400 to-emerald-500'
    if (percentage >= 40) return 'from-yellow-400 via-green-400 to-emerald-400'
    return 'from-gray-400 via-gray-500 to-gray-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative glass-premium p-3 md:p-4 overflow-visible"
    >
      {/* Celebration Effect - Responsive */}
      {showCelebration && (
        <>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1
              }}
              animate={{
                x: Math.cos(i * 30 * Math.PI / 180) * (window.innerWidth < 768 ? 80 : 150),
                y: Math.sin(i * 30 * Math.PI / 180) * (window.innerWidth < 768 ? 80 : 150),
                scale: 1,
                opacity: 0
              }}
              transition={{ duration: 1.5 }}
              className="absolute top-1/2 left-1/2 text-lg md:text-2xl"
            >
              {['🎉', '✨', '🌟', '💫'][i % 4]}
            </motion.div>
          ))}
        </>
      )}

      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-2">
          {/* Premium Icon Badge - Responsive */}
          <motion.div
            animate={{
              rotate: percentage >= 80 ? [0, 10, -10, 0] : 0,
              scale: percentage >= 80 ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: percentage >= 80 ? Infinity : 0,
              repeatDelay: 2,
            }}
            className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br ${getIconGradient()} rounded-lg md:rounded-xl flex items-center justify-center shadow-emerald-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Smile className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </motion.div>

          {/* Text - Responsive */}
          <div>
            <div className="text-[9px] md:text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Smile Index</div>
            <motion.div
              key={percentage}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-2xl md:text-3xl font-bold gradient-text-emerald tracking-tight"
            >
              {percentage}%
            </motion.div>
          </div>
        </div>

        {/* Animated Emoji - Responsive */}
        <motion.span
          key={getEmoji()}
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: 1,
            rotate: 0,
            y: percentage >= 80 ? [0, -8, 0] : 0
          }}
          transition={{
            scale: { type: "spring", stiffness: 200, damping: 12 },
            rotate: { duration: 0.5 },
            y: {
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut"
            }
          }}
          className="text-3xl md:text-5xl drop-shadow-lg"
        >
          {getEmoji()}
        </motion.span>
      </div>

      {/* Premium Progress Bar - Responsive */}
      <div className="relative bg-gradient-to-r from-gray-100 to-gray-50 rounded-full h-2 md:h-2.5 overflow-hidden border border-gray-200/50 shadow-inner">
        <motion.div
          className={`h-full bg-gradient-to-r ${getGradient()} rounded-full relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            boxShadow: percentage >= 80 ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none'
          }}
        >
          {/* Shimmer Effect */}
          {percentage > 0 && (
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

        {/* Percentage Label in Bar - Responsive */}
        {percentage >= 50 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white drop-shadow-md"
          >
            {percentage}%
          </motion.div>
        )}
      </div>

      {/* Trend Indicator - Responsive */}
      {percentage >= 70 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1 md:gap-1.5 mt-1.5 md:mt-2 text-[10px] md:text-xs text-emerald-600 font-semibold"
        >
          <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
          <span>Great smile!</span>
        </motion.div>
      )}
    </motion.div>
  )
}
