'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Timer } from 'lucide-react'

interface StartingCountdownProps {
  countdown: number
  isVisible: boolean
}

export function StartingCountdown({ countdown, isVisible }: StartingCountdownProps) {
  return (
    <AnimatePresence>
      {isVisible && countdown > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2.25rem]"
        >
          <div className="text-center">
            {/* Countdown Number */}
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-4"
            >
              <div className="relative">
                {/* Pulsing ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-400/30 rounded-full blur-2xl"
                />

                {/* Number */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-400">
                  <span className="text-6xl md:text-7xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {countdown}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border-2 border-emerald-300 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-emerald-600" />
                <span className="text-lg font-semibold text-emerald-700">
                  {countdown === 3 && "Get Ready..."}
                  {countdown === 2 && "Position Your Face..."}
                  {countdown === 1 && "Starting Soon..."}
                </span>
              </div>
            </motion.div>

            {/* Progress ring */}
            <motion.div
              className="mt-6 mx-auto w-48 h-2 bg-white/30 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((4 - countdown) / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
