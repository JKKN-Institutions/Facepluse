'use client'

import { useState, useEffect } from 'react'
import { LeaderboardEntry } from '@/types/face'

export function useLeaderboard(currentScore?: number) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Generate or retrieve user ID
  useEffect(() => {
    let userId = localStorage.getItem('userId')
    if (!userId) {
      userId = crypto.randomUUID()
      localStorage.setItem('userId', userId)
    }
    setCurrentUserId(userId)
  }, [])

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(
          data.map((entry: LeaderboardEntry) => ({
            ...entry,
            isCurrentUser: entry.id === currentUserId,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Submit score
  const submitScore = async (score: number) => {
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      })

      if (response.ok) {
        await fetchLeaderboard()
      }
    } catch (error) {
      console.error('Failed to submit score:', error)
    }
  }

  // Auto-refresh leaderboard every 5 seconds
  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 5000)
    return () => clearInterval(interval)
  }, [currentUserId])

  // Auto-submit when current score is high
  useEffect(() => {
    if (currentScore && currentScore >= 90) {
      submitScore(currentScore)
    }
  }, [currentScore])

  return { leaderboard, loading, submitScore }
}
