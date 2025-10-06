'use client'

import { useState, useEffect } from 'react'
import { X, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PrivacyNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('privacy-notice-dismissed')
    if (!dismissed) {
      setVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('privacy-notice-dismissed', 'true')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-8 max-w-md z-50"
        >
          <div className="relative bg-white rounded-2xl p-6 border border-green-100 shadow-xl">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex-1 pr-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Privacy First</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your video is processed in real-time and never stored. All analysis happens securely through OpenAI's API.
                </p>

                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
