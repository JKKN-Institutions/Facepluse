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
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative glass-default p-3 text-center"
    >
      {/* Premium Icon Badge with Motion */}
      <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-teal-100 via-emerald-200 to-green-300 rounded-xl flex items-center justify-center shadow-md border border-emerald-300/50 relative overflow-hidden">
        <motion.div
          animate={{ x: iconPositions[pose] }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
        >
          <User className="w-5 h-5 text-emerald-600" />
        </motion.div>
      </div>

      {/* Label */}
      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Head Pose</div>

      {/* Pose Name */}
      <motion.div
        key={pose}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-xl font-bold text-gray-900 capitalize mb-2"
      >
        {pose}
      </motion.div>

      {/* Position Indicators */}
      <div className="flex justify-center items-center gap-2">
        {(['left', 'center', 'right'] as const).map((position) => (
          <div key={position} className="flex flex-col items-center gap-1">
            <motion.div
              animate={{
                scale: pose === position ? 1.5 : 1,
                backgroundColor: pose === position ? '#10B981' : '#D1D5DB',
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-3 h-3 rounded-full shadow-sm"
            />
            <span className={`text-[9px] uppercase font-semibold tracking-wider ${pose === position ? 'text-emerald-600' : 'text-gray-400'}`}>
              {position}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
