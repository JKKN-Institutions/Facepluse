'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'

export function AnimatedHeadPose({ pose }: { pose: 'left' | 'center' | 'right' }) {
  const iconPositions = {
    left: -12,
    center: 0,
    right: 12,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative glass-default p-2 md:p-3 text-center"
    >
      {/* Premium Icon Badge with Motion - Responsive */}
      <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1.5 md:mb-2 bg-gradient-to-br from-teal-100 via-emerald-200 to-green-300 rounded-lg md:rounded-xl flex items-center justify-center shadow-md border border-emerald-300/50 relative overflow-hidden">
        <motion.div
          animate={{ x: iconPositions[pose] * (window.innerWidth < 768 ? 0.7 : 1) }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
        >
          <User className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
        </motion.div>
      </div>

      {/* Label - Responsive */}
      <div className="text-[9px] md:text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1 md:mb-1.5">Head Pose</div>

      {/* Pose Name - Responsive */}
      <motion.div
        key={pose}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-base md:text-xl font-bold text-gray-900 capitalize mb-1.5 md:mb-2"
      >
        {pose}
      </motion.div>

      {/* Position Indicators - Responsive */}
      <div className="flex justify-center items-center gap-1.5 md:gap-2">
        {(['left', 'center', 'right'] as const).map((position) => (
          <div key={position} className="flex flex-col items-center gap-0.5 md:gap-1">
            <motion.div
              animate={{
                scale: pose === position ? 1.3 : 1,
                backgroundColor: pose === position ? '#10B981' : '#D1D5DB',
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-2 h-2 md:w-3 md:h-3 rounded-full shadow-sm"
            />
            <span className={`text-[8px] md:text-[9px] uppercase font-semibold tracking-wider ${pose === position ? 'text-emerald-600' : 'text-gray-400'}`}>
              {position}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
