'use client'

import { RefObject, useEffect, useRef, useState } from 'react'
import { FaceAnalysis } from '@/types/face'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Camera as CameraIcon } from 'lucide-react'
import * as faceapi from 'face-api.js'

interface CameraProps {
  videoRef: RefObject<HTMLVideoElement | null>
  loading: boolean
  error: string | null
  analysis: FaceAnalysis | null
  analyzing: boolean
  faceDetection: faceapi.WithFaceLandmarks<{detection: faceapi.FaceDetection}, faceapi.FaceLandmarks68> | null
}

export function Camera({ videoRef, loading, error, analysis, analyzing, faceDetection }: CameraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showNoFaceMessage, setShowNoFaceMessage] = useState(false)
  const noFaceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Draw face landmarks on canvas overlay
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !faceDetection) {
      // Clear canvas if no detection
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current

    // Match canvas size to video
    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight,
    }

    faceapi.matchDimensions(canvas, displaySize)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get resized landmarks to match canvas size
    const resizedDetections = faceapi.resizeResults(faceDetection, displaySize)
    const landmarks = resizedDetections.landmarks

    // Drawing style - green/emerald theme
    ctx.strokeStyle = '#10B981' // emerald-500
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Helper function to draw connected points
    const drawPath = (points: faceapi.Point[], close = false, color = '#10B981', lineWidth = 2) => {
      if (points.length < 2) return

      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }

      if (close) {
        ctx.closePath()
      }

      ctx.stroke()
    }

    // Helper function to draw points
    const drawPoints = (points: faceapi.Point[], color = '#34D399', radius = 2) => {
      ctx.fillStyle = color
      points.forEach(point => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    // Draw face contours
    // 1. Jaw outline (main face shape)
    drawPath(landmarks.getJawOutline(), false, '#10B981', 3)

    // 2. Left eyebrow
    drawPath(landmarks.getLeftEyeBrow(), false, '#059669', 2)

    // 3. Right eyebrow
    drawPath(landmarks.getRightEyeBrow(), false, '#059669', 2)

    // 4. Nose bridge and outline
    drawPath(landmarks.getNose(), false, '#34D399', 2)

    // 5. Left eye
    drawPath(landmarks.getLeftEye(), true, '#14B8A6', 2)

    // 6. Right eye
    drawPath(landmarks.getRightEye(), true, '#14B8A6', 2)

    // 7. Mouth outer line
    drawPath(landmarks.getMouth(), true, '#10B981', 2.5)

  }, [faceDetection, videoRef])

  // Debounce "no face" message to prevent blinking
  useEffect(() => {
    const isFaceDetected = analysis?.face_detected

    if (isFaceDetected) {
      // Face detected - immediately hide message and clear timer
      setShowNoFaceMessage(false)
      if (noFaceTimerRef.current) {
        clearTimeout(noFaceTimerRef.current)
        noFaceTimerRef.current = null
      }
    } else {
      // No face detected - wait 2 seconds before showing message
      if (!noFaceTimerRef.current) {
        noFaceTimerRef.current = setTimeout(() => {
          setShowNoFaceMessage(true)
        }, 2000) // 2 second delay
      }
    }

    return () => {
      if (noFaceTimerRef.current) {
        clearTimeout(noFaceTimerRef.current)
        noFaceTimerRef.current = null
      }
    }
  }, [analysis?.face_detected])


  if (loading) {
    return (
      <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto aspect-video rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 md:border-4 border-white shadow-2xl">
        <div className="text-center">
          <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-700 font-semibold text-base md:text-lg">Initializing Camera...</p>
          <p className="text-gray-500 text-xs md:text-sm mt-2">Please allow camera access</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto aspect-video rounded-2xl md:rounded-3xl bg-white flex items-center justify-center border-2 md:border-4 border-red-100 shadow-2xl"
      >
        <div className="text-center p-6 md:p-12">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">Camera Access Required</h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 max-w-md mx-auto px-4">
            Please allow camera permissions in your browser to use facial analysis features.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm md:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      {/* Main Camera Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto"
      >
        {/* Premium Outer Glow - Responsive */}
        <div className="absolute -inset-1 md:-inset-2 bg-gradient-to-br from-emerald-400/40 via-teal-400/30 to-emerald-500/40 rounded-[1.5rem] md:rounded-[2.5rem] blur-2xl md:blur-3xl" />

        {/* Video Container with Multi-layer Border - Responsive */}
        <div className="relative aspect-video rounded-[1.5rem] md:rounded-[2.25rem] overflow-hidden bg-gray-900 border-[3px] md:border-[6px] border-white shadow-[0_12px_32px_rgba(0,0,0,0.15),0_6px_12px_rgba(16,185,129,0.2),inset_0_1px_2px_rgba(255,255,255,0.8)] md:shadow-[0_24px_64px_rgba(0,0,0,0.15),0_12px_24px_rgba(16,185,129,0.2),inset_0_2px_4px_rgba(255,255,255,0.8)]">
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Face Tracking Canvas Overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.9 }}
          />

          {/* Status Badges - Relocated to Bottom - Responsive */}
          <AnimatePresence>
            {analysis?.face_detected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 bg-white/95 backdrop-blur-md px-3 py-2 md:px-6 md:py-3 rounded-full border border-emerald-300/60 md:border-2 shadow-emerald-lg z-10"
              >
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                <span className="text-xs md:text-sm font-bold text-emerald-700">Face Detected</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle Analyzing Glow - Only when actively analyzing */}
          {analyzing && analysis?.face_detected && (
            <motion.div
              className="absolute inset-0 rounded-[1.5rem] md:rounded-[2rem] border-2 border-emerald-400/30 pointer-events-none"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Center Prompt if No Face - Responsive with debounce */}
          <AnimatePresence>
            {showNoFaceMessage && !analyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-center bg-black/50 backdrop-blur-sm px-4 py-4 md:px-8 md:py-6 rounded-xl md:rounded-2xl mx-4">
                  <CameraIcon className="w-8 h-8 md:w-12 md:h-12 text-white mx-auto mb-2 md:mb-3 opacity-75" />
                  <p className="text-white text-sm md:text-lg font-medium">Position your face in the frame</p>
                  <p className="text-white/70 text-xs md:text-sm mt-1">Look directly at the camera</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
