'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 lg:right-96 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-md border-t-2 border-emerald-200/50 py-3 px-4 z-30"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center w-full">
          {/* Primary Text */}
          <motion.p
            className="text-xs font-semibold text-emerald-700"
            whileHover={{ scale: 1.02 }}
          >
            Powered by JICATE Solutions Private Limited © 2025 FacePulse
          </motion.p>

          {/* Separator */}
          <span className="hidden sm:inline text-emerald-400">•</span>

          {/* Developer Credit */}
          <motion.p
            className="text-xs text-gray-600 flex items-center gap-1"
            whileHover={{ scale: 1.02 }}
          >
            Developed by <span className="font-bold text-emerald-600">Roja</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline animate-pulse" />
          </motion.p>
        </div>
      </div>
    </motion.footer>
  )
}
