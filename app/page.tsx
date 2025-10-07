'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Camera } from '@/components/Camera'
import { MetricsPanel } from '@/components/MetricsPanel'
import { CompactLeaderboard } from '@/components/CompactLeaderboard'
import { ExitSummaryPopup } from '@/components/ExitSummaryPopup'
import { Footer } from '@/components/Footer'
import { useCamera } from '@/hooks/useCamera'
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'
import { useMetricsStorage } from '@/hooks/useMetricsStorage'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import { useLeaderboardSupabase } from '@/hooks/useLeaderboardSupabase'
import { useConfetti } from '@/components/Confetti'
import { useState, useEffect } from 'react'

export default function Home() {
  const { videoRef, loading, error } = useCamera()
  const { analysis, analyzing, blinkCount } = useFaceAnalysis(videoRef)

  // Supabase integration
  const { sessionId, loading: sessionLoading, sessionStart } = useSupabaseSession()
  const { lastMetric } = useMetricsStorage(sessionId, analysis, blinkCount, videoRef)
  const { facePresent, showExitPopup, setShowExitPopup, lastFaceImage } = useFaceDetection(analysis, videoRef)
  const { entries: leaderboard } = useLeaderboardSupabase()

  // Session duration tracking
  const [sessionDuration, setSessionDuration] = useState(0)

  // Track session duration
  useEffect(() => {
    if (!sessionStart) return

    const interval = setInterval(() => {
      const duration = Math.floor((new Date().getTime() - sessionStart.getTime()) / 1000)
      setSessionDuration(duration)
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionStart])

  // Trigger confetti when smile reaches 90%
  useConfetti(analysis?.smile_percentage || 0)

  const handleClosePopup = () => {
    setShowExitPopup(false)
  }

  // Show loading state while session initializes
  if (sessionLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Initializing session...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
        {/* New Vertical Layout */}
        <div className="h-full flex flex-col overflow-hidden">
          {/* Top Section: Camera + Compact Leaderboard */}
          <div className="flex-1 overflow-y-auto lg:pr-96">
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              {/* Camera Section - Centered */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-4xl">
                  <Camera videoRef={videoRef} loading={loading} error={error} analysis={analysis} analyzing={analyzing} />
                </div>
              </div>

              {/* Compact Leaderboard - Top 5 */}
              <div className="w-full max-w-6xl mx-auto">
                <CompactLeaderboard entries={leaderboard} />
              </div>
            </div>
          </div>

          {/* Bottom/Side Section: Metrics Panel - Fixed on Desktop */}
          <div className="lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-96 bg-gradient-to-br from-white/80 to-emerald-50/60 backdrop-blur-lg border-t-2 lg:border-l-2 lg:border-t-0 border-emerald-200/50 overflow-y-auto scrollbar-thin shadow-2xl">
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <MetricsPanel analysis={analysis} blinkCount={blinkCount} />
            </div>
          </div>
        </div>

        {/* Exit Summary Popup */}
        <ExitSummaryPopup
          isOpen={showExitPopup}
          onClose={handleClosePopup}
          lastMetric={lastMetric}
          sessionDuration={sessionDuration}
          lastFaceImage={lastFaceImage}
          sessionId={sessionId}
          blinkCount={blinkCount}
        />

        {/* Footer */}
        <Footer />
      </DashboardLayout>
  )
}
