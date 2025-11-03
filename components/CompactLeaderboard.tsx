'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { LeaderboardEntry } from '@/lib/supabase/client'
import { useMemo, useState } from 'react'

interface CompactLeaderboardProps {
  entries?: LeaderboardEntry[]
}

// Leaderboard Image Component with Error Handling
function LeaderboardImage({ src, alt, size = 20 }: { src: string | null; alt: string; size?: number }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Show fallback if no URL or error occurred
  if (!src || imageError) {
    return (
      <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border-4 border-emerald-200 shadow-lg`}>
        <span className="text-4xl">😊</span>
      </div>
    )
  }

  return (
    <div className={`relative w-${size} h-${size} rounded-full overflow-hidden border-4 border-emerald-200 shadow-lg`}>
      {/* Loading skeleton */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 animate-pulse" />
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          console.warn(`Failed to load leaderboard image: ${src}`)
          setImageError(true)
          setImageLoading(false)
        }}
      />
    </div>
  )
}

export function CompactLeaderboard({ entries = [] }: CompactLeaderboardProps) {
  // Get only top 5 entries
  const top5 = useMemo(() => entries.slice(0, 5), [entries])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-400 to-yellow-600'
    if (index === 1) return 'from-slate-300 to-slate-500'
    if (index === 2) return 'from-orange-400 to-orange-600'
    return 'from-emerald-400 to-emerald-600'
  }

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return '🏅'
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Top Smiles</h3>
            <p className="text-xs text-gray-500 font-medium">Last 24 hours</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/50">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Top 5 Cards - Horizontal Scroll */}
      {top5.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base text-gray-500 font-semibold">No entries yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to smile!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {top5.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRankColor(index)} flex items-center justify-center shadow-md border-2 border-white`}>
                  <span className="text-xl">{getRankEmoji(index)}</span>
                </div>
                <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
              </div>

              {/* Screenshot Image with Error Handling */}
              <div className="flex justify-center mb-3">
                <LeaderboardImage
                  src={entry.screenshot_url}
                  alt={`Smile ${index + 1}`}
                  size={20}
                />
              </div>

              {/* Score */}
              <div className="text-center mb-2">
                <div className="text-2xl font-black text-gray-800 mb-1">
                  {entry.smile_percentage}%
                </div>
                <div className="text-xs text-gray-500 font-medium">Smile Score</div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
                <motion.div
                  className={`h-full bg-gradient-to-r ${getRankColor(index)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${entry.smile_percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Timestamp */}
              <div className="text-center text-xs text-gray-400 font-medium">
                {formatTimestamp(entry.created_at)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
