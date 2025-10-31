'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Camera } from '@/components/Camera'
import { MetricsPanel } from '@/components/MetricsPanel'
import { CompactLeaderboard } from '@/components/CompactLeaderboard'
import { ExitSummaryPopup } from '@/components/ExitSummaryPopup'
import { Footer } from '@/components/Footer'
import { EmotionQuote } from '@/components/EmotionQuote'
import { useCamera } from '@/hooks/useCamera'
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'
import { useMetricsStorage } from '@/hooks/useMetricsStorage'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import { useLeaderboardSupabase } from '@/hooks/useLeaderboardSupabase'
import { useConfetti } from '@/components/Confetti'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { Metric } from '@/lib/supabase/client'

export default function Home() {
  const { videoRef, loading, error } = useCamera()
  const { analysis, analyzing, blinkCount, faceDetection } = useFaceAnalysis(videoRef)

  // Supabase integration
  const { sessionId, loading: sessionLoading, sessionStart } = useSupabaseSession()

  // Emotion capture tracking (capture each unique emotion once)
  const [capturedEmotions, setCapturedEmotions] = useState<string[]>([])
  const lastCaptureTimeRef = useRef<number>(0)
  const lastCapturedEmotionRef = useRef<string | null>(null) // Track last captured emotion for change detection
  const emotionHistoryRef = useRef<string[]>([]) // Track last 3 emotions for stability

  const { lastMetric, captureOnce, getLastMetric } = useMetricsStorage(
    sessionId,
    analysis,
    blinkCount,
    videoRef,
    capturedEmotions.length > 0 // Enable continuous storage after first capture
  )
  const { showExitPopup, setShowExitPopup, lastFaceImage, manualEndSession } = useFaceDetection(analysis, videoRef)
  const { entries: leaderboard } = useLeaderboardSupabase()

  // Captured metric state (for display in metrics panel)
  const [capturedMetric, setCapturedMetric] = useState<Metric | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  // Session duration tracking
  const [sessionDuration, setSessionDuration] = useState(0)

  // Session ending countdown state
  const [showEndingMessage, setShowEndingMessage] = useState(false)

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

  // Show "Session ending..." message when face disappears
  useEffect(() => {
    if (!analysis?.face_detected && capturedEmotions.length > 0) {
      setShowEndingMessage(true)
    } else {
      setShowEndingMessage(false)
    }
  }, [analysis?.face_detected, capturedEmotions.length])

  // Helper functions for emotion capture
  const captureVideoFrame = () => {
    if (!videoRef?.current) return null

    try {
      const video = videoRef.current
      if (video.readyState !== 4) return null

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/jpeg', 0.8)
    } catch (error) {
      console.error('Error capturing frame:', error)
      return null
    }
  }

  const triggerCameraFlash = () => {
    // Create flash effect element
    const flash = document.createElement('div')
    flash.className = 'camera-flash'
    document.body.appendChild(flash)

    // Remove flash after animation
    setTimeout(() => {
      document.body.removeChild(flash)
    }, 500)
  }

  const handleEmotionCapture = useCallback(async () => {
    if (!analysis?.face_detected || !analysis?.emotion) return

    console.log('📸 Starting emotion capture for:', analysis.emotion)

    const isFirstCapture = capturedEmotions.length === 0

    // Add emotion to captured list
    setCapturedEmotions(prev => [...prev, analysis.emotion])

    // Update cooldown timestamp
    lastCaptureTimeRef.current = Date.now()

    // Trigger flash effect
    triggerCameraFlash()

    // Capture current video frame
    const frameImage = captureVideoFrame()
    console.log('🖼️ Frame captured:', frameImage ? 'success' : 'failed')

    // Store captured image
    setCapturedImage(frameImage)

    // Save to database FIRST and wait for the result
    console.log('💾 Saving metric to database...')
    const savedMetric = await captureOnce()

    if (savedMetric) {
      console.log('✅ Metric saved to database:', {
        emotion: savedMetric.emotion,
        smile: savedMetric.smile_percentage,
        age: savedMetric.age_estimate,
        confidence: savedMetric.emotion_confidence
      })

      // Use the actual saved metric from database
      setCapturedMetric(savedMetric)

      // Just log the capture - metrics are displayed in the metrics panel
      console.log('✅ Emotion captured and saved:', {
        emotion: savedMetric.emotion,
        smile: savedMetric.smile_percentage,
        captureCount: capturedEmotions.length,
        isFirstCapture
      })
    } else {
      console.error('❌ Failed to save metric to database')

      // FALLBACK: Still set metric for display in metrics panel
      const fallbackMetric = {
        smile_percentage: Math.round(analysis.smile_percentage),
        emotion: analysis.emotion,
        emotion_confidence: Math.round(analysis.emotion_confidence),
        age_estimate: Math.round(analysis.age_estimate || 0),
        blink_count: blinkCount,
        head_pose: analysis.head_pose,
        face_detected: analysis.face_detected,
      } as Metric

      setCapturedMetric(fallbackMetric)
      console.log('⚠️ Using fallback data (DB save failed)')
    }
  }, [analysis, capturedEmotions.length, captureOnce])

  // Check emotion stability and trigger capture for new emotions
  useEffect(() => {
    console.log('🔄 Emotion capture effect running', {
      faceDetected: analysis?.face_detected,
      emotion: analysis?.emotion,
      sessionId,
      sessionLoading
    })

    if (!analysis?.face_detected) {
      console.log('⏸️ No face detected - skipping capture check')
      return
    }

    if (!analysis?.emotion) {
      console.log('⏸️ No emotion detected - skipping capture check')
      return
    }

    if (!sessionId || sessionLoading) {
      console.log('⏸️ Session not ready - skipping capture check', { sessionId, sessionLoading })
      return
    }

    // Track emotion history for stability check
    emotionHistoryRef.current.push(analysis.emotion)
    if (emotionHistoryRef.current.length > 2) {
      emotionHistoryRef.current.shift() // Keep only last 2
    }

    // Check if emotion is stable (same for last 2 detections) - faster response
    const isStable = emotionHistoryRef.current.length === 2 &&
      emotionHistoryRef.current.every(e => e === analysis.emotion)

    if (!isStable) {
      console.log('⏳ Emotion not stable yet, history:', emotionHistoryRef.current)
      return // Wait for stability
    }

    // Check if this is a NEW or CHANGED emotion (different from last captured)
    const isNewEmotion = !capturedEmotions.includes(analysis.emotion)
    const isEmotionChange = lastCapturedEmotionRef.current !== null &&
                           lastCapturedEmotionRef.current !== analysis.emotion

    // Check cooldown (1 second since last capture for faster response)
    const now = Date.now()
    const timeSinceLastCapture = now - lastCaptureTimeRef.current
    const cooldownPassed = timeSinceLastCapture > 1000 || lastCaptureTimeRef.current === 0

    console.log('🔍 Emotion capture check:', {
      emotion: analysis.emotion,
      isStable,
      isNewEmotion,
      isEmotionChange,
      lastCapturedEmotion: lastCapturedEmotionRef.current,
      cooldownPassed,
      timeSinceLastCapture,
      capturedEmotions
    })

    // Capture if: (1) it's a brand new emotion OR (2) emotion changed from last capture AND cooldown passed
    if ((isNewEmotion || isEmotionChange) && cooldownPassed) {
      console.log('📸 Triggering emotion capture for:', analysis.emotion)
      lastCapturedEmotionRef.current = analysis.emotion // Update last captured emotion
      handleEmotionCapture()
    } else {
      if (!isNewEmotion && !isEmotionChange) {
        console.log('⏭️ Same emotion as last capture, skipping')
      }
      if (!cooldownPassed) {
        console.log('⏭️ Cooldown not passed yet, waiting...')
      }
    }
  }, [analysis?.face_detected, analysis?.emotion, sessionId, sessionLoading, capturedEmotions, handleEmotionCapture])

  const handleRecapture = () => {
    // Remove the last captured emotion to allow re-capture
    setCapturedEmotions(prev => prev.slice(0, -1))

    // Reset last captured emotion ref
    lastCapturedEmotionRef.current = capturedEmotions.length > 1
      ? capturedEmotions[capturedEmotions.length - 2]
      : null

    // Reset emotion history to allow immediate re-detection
    emotionHistoryRef.current = []

    // Reset captured data
    setCapturedMetric(null)
    setCapturedImage(null)

    console.log('🔄 Ready to capture again - show different emotion')
  }

  const handleClosePopup = () => {
    setShowExitPopup(false)
  }

  // Capture final metric when session is ending (manual or automatic)
  useEffect(() => {
    if (showExitPopup && sessionId) {
      // Fetch the most recent metric from database to show in exit popup
      getLastMetric(sessionId)
    }
  }, [showExitPopup, sessionId])

  // Note: Session loading is non-blocking - app works even if session creation fails
  // This ensures users can always use the app, with or without session tracking

  return (
    <DashboardLayout>
        {/* Responsive Layout: Vertical on mobile/tablet, horizontal on desktop */}
        <div className="h-full flex flex-col lg:flex-row overflow-hidden">
          {/* Camera Section - Takes full width on mobile/tablet, scrollable */}
          <div className="flex-1 overflow-y-auto relative z-0">
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              {/* Emotion Quote - Above Camera */}
              {analysis?.face_detected && (
                <EmotionQuote emotion={analysis.emotion} />
              )}

              {/* Camera Section - Centered */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-4xl relative">
                  <Camera videoRef={videoRef} loading={loading} error={error} analysis={analysis} analyzing={analyzing} faceDetection={faceDetection} />

                  {/* Session Ending Message */}
                  {showEndingMessage && !showExitPopup && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-semibold"
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Session ending in 1.5s...
                    </motion.div>
                  )}

                  {/* End Session Button - Floating */}
                  {capturedEmotions.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={manualEndSession}
                      className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-sm transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      End Session
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Compact Leaderboard - Top 5 */}
              <div className="w-full max-w-6xl mx-auto">
                <CompactLeaderboard entries={leaderboard} />
              </div>
            </div>
          </div>

          {/* Metrics Panel - Bottom on mobile/tablet, right sidebar on desktop */}
          <div className="
            w-full lg:w-96
            flex-shrink-0
            bg-gradient-to-br from-white/80 to-emerald-50/60 backdrop-blur-lg
            border-t-2 lg:border-l-2 lg:border-t-0 border-emerald-200/50
            overflow-y-auto scrollbar-thin shadow-2xl
            z-10
          ">
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
