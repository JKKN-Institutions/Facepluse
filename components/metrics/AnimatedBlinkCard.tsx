'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AnimatedBlinkCard({ blinks }: { blinks: number }) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [prevBlinks, setPrevBlinks] = useState(blinks)

  useEffect(() => {
    if (blinks > prevBlinks) {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 200)
    }
    setPrevBlinks(blinks)
  }, [blinks])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative glass-default p-3 text-center"
    >
      {/* Premium Icon Badge - Larger */}
      <motion.div
        animate={{
          scale: isBlinking ? [1, 0.85, 1] : 1,
        }}
        className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 rounded-xl flex items-center justify-center shadow-md border border-emerald-300/50"
      >
        <AnimatePresence mode="wait">
          {isBlinking ? (
            <motion.div
              key="closed"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0.1 }}
              exit={{ scaleY: 1 }}
              transition={{ duration: 0.1 }}
            >
              <EyeOff className="w-5 h-5 text-emerald-600" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Eye className="w-5 h-5 text-emerald-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Label */}
      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Blinks</div>

      {/* Count - Larger */}
      <motion.div
        key={blinks}
        initial={{ scale: 1.5, color: '#10B981' }}
        animate={{ scale: 1, color: '#1F2937' }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-2xl font-bold text-gray-900 mb-1.5"
      >
        {blinks}
      </motion.div>

      {/* Active Indicator */}
      {blinks > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-semibold border border-emerald-200/50"
        >
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span>Active</span>
        </motion.div>
      )}
    </motion.div>
  )
}
