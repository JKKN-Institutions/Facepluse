'use client'

import { useLeaderboard } from '@/hooks/useLeaderboard'
import { StatusBadge } from './ui/StatusBadge'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Trophy } from 'lucide-react'

interface LeaderboardProps {
  currentScore?: number
}

export function Leaderboard({ currentScore }: LeaderboardProps) {
  const { leaderboard, loading } = useLeaderboard(currentScore)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (loading) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full glass-premium p-4 max-h-[340px] overflow-hidden"
    >
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gradient-to-r from-emerald-200 to-teal-200">
        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-gold-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span>Top Smiles</span>
        </h3>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/50">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Premium List */}
      <div className="space-y-2 overflow-y-auto max-h-[260px] pr-2 scrollbar-thin">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-xl">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No entries yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to smile!</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => {
            // Premium rank badge styling
            const getRankBadge = () => {
              if (index === 0) {
                return 'w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-gold-lg text-white border-2 border-yellow-300 text-base'
              }
              if (index === 1) {
                return 'w-9 h-9 rounded-xl bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-[0_4px_12px_rgba(148,163,184,0.4)] text-white border-2 border-slate-200 text-sm'
              }
              if (index === 2) {
                return 'w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-[0_4px_12px_rgba(251,146,60,0.4)] text-white border-2 border-orange-300 text-sm'
              }
              return 'w-7 h-7 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 text-white text-xs'
            }

            const getScoreGradient = () => {
              if (index === 0) return 'from-yellow-400 via-yellow-500 to-yellow-600'
              if (index === 1) return 'from-slate-400 via-slate-500 to-slate-600'
              if (index === 2) return 'from-orange-400 via-orange-500 to-orange-600'
              return 'from-emerald-400 to-teal-500'
            }

            const getCardBg = () => {
              if (entry.isCurrentUser) return 'bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border-2 border-emerald-300/60'
              if (index < 3) return 'bg-white/80 border-2 border-gray-200/60'
              return 'bg-white/60 border border-gray-200/50'
            }

            return (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                key={entry.id}
                className={cn(
                  'p-3 rounded-2xl transition-all duration-300',
                  getCardBg(),
                  index < 3 && 'shadow-md hover:shadow-lg',
                  entry.isCurrentUser && 'ring-2 ring-emerald-400/50'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Premium Rank Badge */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={cn(
                      'flex items-center justify-center font-black shrink-0',
                      getRankBadge()
                    )}
                  >
                    {index + 1}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    {/* Premium Score Bar - Thicker */}
                    <div className="bg-gray-200/80 rounded-full h-2 overflow-hidden mb-2 border border-gray-300/50">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${getScoreGradient()} relative overflow-hidden`}
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.score}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {/* Shimmer Effect */}
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
                      </motion.div>
                    </div>

                    {/* Details - Better Typography */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-800">
                        {entry.score}% smile
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
