'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Camera } from '@/components/Camera'
import { MetricsPanel } from '@/components/MetricsPanel'
import { CompactLeaderboard } from '@/components/CompactLeaderboard'
import { ExitSummaryPopup } from '@/components/ExitSummaryPopup'
import { FirstCapturePopup } from '@/components/FirstCapturePopup'
import { Footer } from '@/components/Footer'
import { EmotionQuote } from '@/components/EmotionQuote'
import { useCamera } from '@/hooks/useCamera'
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'
import { useMetricsStorage } from '@/hooks/useMetricsStorage'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import { useLeaderboardSupabase } from '@/hooks/useLeaderboardSupabase'
import { useConfetti } from '@/components/Confetti'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'

export default function Home() {
  const { videoRef, loading, error } = useCamera()
  const { analysis, analyzing, blinkCount } = useFaceAnalysis(videoRef)

  // Supabase integration
  const { sessionId, loading: sessionLoading, sessionStart } = useSupabaseSession()

  // Emotion capture tracking (capture each unique emotion once)
  const [capturedEmotions, setCapturedEmotions] = useState<string[]>([])
  const lastCaptureTimeRef = useRef<number>(0)
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

  // Popup state
  const [showCapturePopup, setShowCapturePopup] = useState(false)
  const [capturedMetric, setCapturedMetric] = useState(null)
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

  // Check emotion stability and trigger capture for new emotions
  useEffect(() => {
    if (!analysis?.face_detected || !analysis?.emotion || !sessionId || sessionLoading) {
      return
    }

    // Track emotion history for stability check
    emotionHistoryRef.current.push(analysis.emotion)
    if (emotionHistoryRef.current.length > 3) {
      emotionHistoryRef.current.shift() // Keep only last 3
    }

    // Check if emotion is stable (same for last 3 detections)
    const isStable = emotionHistoryRef.current.length === 3 &&
      emotionHistoryRef.current.every(e => e === analysis.emotion)

    if (!isStable) {
      return // Wait for stability
    }

    // Check if this emotion already captured
    const alreadyCaptured = capturedEmotions.includes(analysis.emotion)

    // Check cooldown (2 seconds since last capture)
    const now = Date.now()
    const timeSinceLastCapture = now - lastCaptureTimeRef.current
    const cooldownPassed = timeSinceLastCapture > 2000 || lastCaptureTimeRef.current === 0

    console.log('🔍 Emotion capture check:', {
      emotion: analysis.emotion,
      isStable,
      alreadyCaptured,
      cooldownPassed,
      capturedEmotions
    })

    if (!alreadyCaptured && cooldownPassed) {
      console.log('📸 Triggering emotion capture for:', analysis.emotion)
      handleEmotionCapture()
    }
  }, [analysis?.face_detected, analysis?.emotion, sessionId, sessionLoading, capturedEmotions])

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

  const handleEmotionCapture = async () => {
    if (!analysis?.face_detected || !analysis?.emotion) return

    console.log('📸 Starting emotion capture for:', analysis.emotion)

    // Add emotion to captured list
    setCapturedEmotions(prev => [...prev, analysis.emotion])

    // Update cooldown timestamp
    lastCaptureTimeRef.current = Date.now()

    // Trigger flash effect
    triggerCameraFlash()

    // Capture current video frame
    const frameImage = captureVideoFrame()
    console.log('🖼️ Frame captured:', frameImage ? 'success' : 'failed')

    // Create metric object from current analysis (actual real-time data)
    const currentMetric = {
      smile_percentage: Math.round(analysis.smile_percentage),
      emotion: analysis.emotion,
      emotion_confidence: Math.round(analysis.emotion_confidence),
      age_estimate: Math.round(analysis.age_estimate || 0),
      blink_count: blinkCount,
      head_pose: analysis.head_pose,
      face_detected: analysis.face_detected,
    }

    console.log('📊 Captured metrics:', currentMetric)

    // Store captured data with actual current metrics
    setCapturedMetric(currentMetric)
    setCapturedImage(frameImage)

    // Show popup immediately with actual metrics
    setShowCapturePopup(true)
    console.log('✅ Popup displayed with actual metrics')

    // Save to database in background (don't wait)
    captureOnce().then((savedMetric) => {
      console.log('💾 Metric saved to database:', savedMetric)
    })
  }

  const handleRecapture = () => {
    // Remove the last captured emotion to allow re-capture
    setCapturedEmotions(prev => prev.slice(0, -1))

    // Reset emotion history to allow immediate re-detection
    emotionHistoryRef.current = []

    // Close popup
    setShowCapturePopup(false)
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
          <div className="flex-1 overflow-y-auto lg:pr-96 relative z-0">
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              {/* Captured Emotions Indicator */}
              {capturedEmotions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 flex-wrap"
                >
                  <span className="text-sm font-semibold text-gray-600">Captured:</span>
                  {capturedEmotions.map((emotion, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full text-xs font-semibold capitalize shadow-md"
                    >
                      {emotion}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Emotion Quote - Above Camera */}
              {analysis?.face_detected && (
                <EmotionQuote emotion={analysis.emotion} />
              )}

              {/* Camera Section - Centered */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-4xl relative">
                  <Camera videoRef={videoRef} loading={loading} error={error} analysis={analysis} analyzing={analyzing} />

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
                  {capturedEmotions.length > 0 && !showCapturePopup && (
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

          {/* Bottom/Side Section: Metrics Panel - Fixed on Desktop */}
          <div className="lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-96 bg-gradient-to-br from-white/80 to-emerald-50/60 backdrop-blur-lg border-t-2 lg:border-l-2 lg:border-t-0 border-emerald-200/50 overflow-y-auto scrollbar-thin shadow-2xl z-50">
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <MetricsPanel analysis={analysis} blinkCount={blinkCount} />
            </div>
          </div>
        </div>

        {/* First Capture Popup */}
        <FirstCapturePopup
          isOpen={showCapturePopup}
          onClose={() => setShowCapturePopup(false)}
          capturedImage={capturedImage}
          metric={capturedMetric}
          sessionDuration={sessionDuration}
          onRecapture={handleRecapture}
        />

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
