'use client'

import { motion } from 'framer-motion'
import { Camera, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function ScreenshotButton() {
  const [capturing, setCapturing] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleScreenshot = async () => {
    try {
      setCapturing(true)

      // Capture the entire screen
      const canvas = document.createElement('canvas')
      const video = document.querySelector('video') as HTMLVideoElement

      if (!video) {
        throw new Error('No video element found')
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')

      ctx.drawImage(video, 0, 0)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to capture screenshot')
          return
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `smile-analysis-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)

        setSuccess(true)
        toast.success('Screenshot saved!')

        setTimeout(() => {
          setSuccess(false)
        }, 2000)
      }, 'image/png')
    } catch (error) {
      console.error('Screenshot error:', error)
      toast.error('Failed to capture screenshot')
    } finally {
      setCapturing(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-[26rem] w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg flex items-center justify-center z-50"
      onClick={handleScreenshot}
      disabled={capturing}
    >
      {/* Pulsing Ring - Responsive */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />

      {/* Icon - Responsive */}
      <motion.div
        className="relative z-10"
        animate={capturing ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: capturing ? Infinity : 0 }}
      >
        {success ? (
          <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
        ) : (
          <Camera className="w-4 h-4 md:w-5 md:h-5 text-white" />
        )}
      </motion.div>
    </motion.button>
  )
}
