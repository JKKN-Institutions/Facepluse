'use client'

import { useState, useEffect, useRef } from 'react'

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function initCamera() {
      try {
        let mediaStream: MediaStream | null = null

        // Try with ideal constraints first
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          })
        } catch (e) {
          // Fallback to minimal constraints
          console.log('Trying fallback camera constraints...')
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            })
          } catch (fallbackErr) {
            throw fallbackErr
          }
        }

        if (!mediaStream) {
          throw new Error('No camera stream available')
        }

        setStream(mediaStream)
        setLoading(false)
      } catch (err) {
        console.error('Camera error:', err)
        setError('Camera access denied. Please allow camera permissions.')
        setLoading(false)
      }
    }

    initCamera()

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  // Separate effect to handle video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch((err) => {
        console.error('Error playing video:', err)
      })
    }
  }, [stream])

  return { stream, error, loading, videoRef }
}
