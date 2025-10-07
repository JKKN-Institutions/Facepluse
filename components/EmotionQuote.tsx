'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'

interface EmotionQuoteProps {
  emotion: 'happy' | 'sad' | 'neutral' | 'surprised' | 'angry'
}

export function EmotionQuote({ emotion }: EmotionQuoteProps) {
  const [quote, setQuote] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Fetch quote only once per session (on component mount)
  useEffect(() => {
    fetchQuote()
  }, [])

  const fetchQuote = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion }),
      })

      const data = await response.json()
      setQuote(data.quote)
    } catch (error) {
      console.error('Failed to fetch quote:', error)
      setQuote('Keep smiling! You are amazing!')
    } finally {
      setLoading(false)
    }
  }

  const getEmotionColor = () => {
    switch (emotion) {
      case 'happy':
        return 'from-yellow-400 to-orange-400'
      case 'sad':
        return 'from-blue-400 to-cyan-400'
      case 'surprised':
        return 'from-purple-400 to-pink-400'
      case 'angry':
        return 'from-red-400 to-orange-500'
      default:
        return 'from-emerald-400 to-teal-400'
    }
  }

  const getEmotionEmoji = () => {
    switch (emotion) {
      case 'happy':
        return '😊'
      case 'sad':
        return '💙'
      case 'surprised':
        return '✨'
      case 'angry':
        return '🌸'
      default:
        return '🌟'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto mb-4"
    >
      <div className="relative">
        {/* Background Glow */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${getEmotionColor()} rounded-2xl blur-xl opacity-30 animate-pulse`} />

        {/* Quote Card */}
        <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-6 border-2 border-white shadow-2xl">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${getEmotionColor()} flex items-center justify-center shadow-lg flex-shrink-0`}
            >
              <span className="text-2xl md:text-3xl">{getEmotionEmoji()}</span>
            </motion.div>

            {/* Quote Text */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                    <span className="text-sm text-gray-500">Generating inspiration...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={quote}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-base md:text-lg font-semibold text-gray-800 leading-relaxed">
                      {quote}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sparkle Icon */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="flex-shrink-0"
            >
              <Sparkles className={`w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br ${getEmotionColor()} bg-clip-text text-transparent`} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
