'use client'

import { Sparkles, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand - Responsive */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-4"
          >
            {/* Logo - Responsive */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl md:rounded-2xl blur opacity-50" />
              <div className="relative w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>

            {/* Brand Text - Responsive */}
            <div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              FacePulse
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-medium hidden sm:block">Live Facial Intelligence</p>
            </div>
          </motion.div>

          {/* Right Side - Status Indicators - Responsive */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-4"
          >
            {/* Live Status - Responsive */}
            <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1.5 md:px-4 md:py-2 rounded-full border border-green-200">
              <div className="relative">
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full animate-ping" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-green-700">Live</span>
            </div>

            {/* Activity Indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-200 shadow-sm">
              <Activity className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
              <span className="text-xs md:text-sm font-medium text-gray-700">Active</span>
            </div>
          </motion.div>
        </div>
      </div>
    </nav>
  )
}
