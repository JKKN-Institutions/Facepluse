'use client'

import { FaceAnalysis } from '@/types/face'
import { AnimatedEmotion } from './emotions/AnimatedEmotion'
import { AnimatedSmileCard } from './metrics/AnimatedSmileCard'
import { AnimatedBlinkCard } from './metrics/AnimatedBlinkCard'
import { AnimatedHeadPose } from './metrics/AnimatedHeadPose'

interface MetricsPanelProps {
  analysis: FaceAnalysis
  blinkCount: number
}

export function MetricsPanel({ analysis, blinkCount }: MetricsPanelProps) {
  const smilePercentage = analysis.smile_percentage || 0
  const emotion = analysis.emotion || 'neutral'
  const emotionConfidence = analysis.emotion_confidence || 0
  const headPose = analysis.head_pose || 'center'

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Animated Smile Card */}
      <AnimatedSmileCard percentage={smilePercentage} />

      {/* Animated Emotion */}
      <AnimatedEmotion
        emotion={emotion}
        confidence={emotionConfidence}
      />

      {/* Activity Grid - Responsive spacing */}
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <AnimatedBlinkCard blinks={blinkCount} />
        <AnimatedHeadPose pose={headPose} />
      </div>
    </div>
  )
}
