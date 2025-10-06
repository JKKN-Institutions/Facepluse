'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Camera } from '@/components/Camera'
import { MetricsPanel } from '@/components/MetricsPanel'
import { Leaderboard } from '@/components/Leaderboard'
import { ScreenshotButton } from '@/components/ScreenshotButton'
import { PrivacyNotice } from '@/components/PrivacyNotice'
import { useCamera } from '@/hooks/useCamera'
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis'
import { useConfetti } from '@/components/Confetti'

export default function Home() {
  const { videoRef, loading, error } = useCamera()
  const { analysis, analyzing, blinkCount } = useFaceAnalysis(videoRef)

  // Trigger confetti when smile reaches 90%
  useConfetti(analysis?.smile_percentage || 0)

  return (
    <DashboardLayout>
      {/* Split Screen Layout - Premium Spacing */}
      <div className="h-full flex overflow-hidden gap-6">
        {/* Left: Camera - 58% */}
        <div className="w-[58%] flex items-center justify-center p-12">
          <div className="w-full h-full flex items-center justify-center">
            <Camera videoRef={videoRef} loading={loading} error={error} analysis={analysis} analyzing={analyzing} />
          </div>
        </div>

        {/* Right: Metrics Sidebar - 42% */}
        <div className="w-[42%] bg-gradient-to-br from-white/60 to-emerald-50/40 backdrop-blur-md border-l-2 border-emerald-200/50 overflow-y-auto scrollbar-thin">
          <div className="p-6 space-y-4 max-w-2xl">
            <MetricsPanel analysis={analysis} blinkCount={blinkCount} />
            <Leaderboard currentScore={analysis?.smile_percentage} />
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <ScreenshotButton />

      {/* Privacy Notice */}
      <PrivacyNotice />
    </DashboardLayout>
  )
}
