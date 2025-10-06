'use client'

import { RefObject } from 'react'
import { FaceAnalysis } from '@/types/face'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Loader2, Camera as CameraIcon } from 'lucide-react'

interface CameraProps {
  videoRef: RefObject<HTMLVideoElement>
  loading: boolean
  error: string | null
  analysis: FaceAnalysis | null
  analyzing: boolean
}

export function Camera({ videoRef, loading, error, analysis, analyzing }: CameraProps) {

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto aspect-video rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white shadow-2xl">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Initializing Camera...</p>
          <p className="text-gray-500 text-sm mt-2">Please allow camera access</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto aspect-video rounded-3xl bg-white flex items-center justify-center border-4 border-red-100 shadow-2xl"
      >
        <div className="text-center p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Camera Access Required</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Please allow camera permissions in your browser to use facial analysis features.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
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
        className="relative max-w-4xl mx-auto"
      >
        {/* Premium Outer Glow - Stronger */}
        <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/40 via-teal-400/30 to-emerald-500/40 rounded-[2.5rem] blur-3xl" />

        {/* Video Container with Multi-layer Border */}
        <div className="relative aspect-video rounded-[2.25rem] overflow-hidden bg-gray-900 border-[6px] border-white shadow-[0_24px_64px_rgba(0,0,0,0.15),0_12px_24px_rgba(16,185,129,0.2),inset_0_2px_4px_rgba(255,255,255,0.8)]">
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Status Badges - Relocated to Bottom */}
          <AnimatePresence>
            {analysis?.face_detected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border-2 border-emerald-300/60 shadow-emerald-lg z-10"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Face Detected</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyzing Indicator - Top Right */}
          <AnimatePresence>
            {analyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute top-6 right-6 flex items-center gap-2 bg-blue-50/95 backdrop-blur-md px-4 py-2 rounded-full border-2 border-blue-300/60 shadow-lg z-10"
              >
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm font-bold text-blue-700">Analyzing...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Analyzing Glow - Stronger */}
          {analyzing && (
            <motion.div
              className="absolute inset-0 rounded-[2rem] border-4 border-emerald-400 pointer-events-none"
              animate={{
                opacity: [0.4, 0.8, 0.4],
                boxShadow: [
                  '0 0 30px rgba(16, 185, 129, 0.5), inset 0 0 30px rgba(16, 185, 129, 0.3)',
                  '0 0 50px rgba(16, 185, 129, 0.7), inset 0 0 50px rgba(16, 185, 129, 0.5)',
                  '0 0 30px rgba(16, 185, 129, 0.5), inset 0 0 30px rgba(16, 185, 129, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Center Prompt if No Face */}
          {!analysis?.face_detected && !analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center bg-black/50 backdrop-blur-sm px-8 py-6 rounded-2xl">
                <CameraIcon className="w-12 h-12 text-white mx-auto mb-3 opacity-75" />
                <p className="text-white text-lg font-medium">Position your face in the frame</p>
                <p className="text-white/70 text-sm mt-1">Look directly at the camera</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Premium Bottom Info Bar */}
        <div className="mt-6 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200/50 shadow-sm">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-sm font-semibold text-emerald-700">Camera Active</span>
          </div>
          <div className="text-sm font-medium text-gray-600 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
            {analysis?.face_detected ? '✓ Processing in real-time' : '⏳ Waiting for face...'}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
