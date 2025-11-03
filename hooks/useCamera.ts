'use client'

import { useState, useEffect, useRef } from 'react'

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let mounted = true
    let loadingTimeout: NodeJS.Timeout
    let eventListenersAdded = false
    let videoElement: HTMLVideoElement | null = null

    async function initCamera() {
      try {
        console.log('🎥 Requesting camera access...')

        // Set a 3-second timeout fallback to prevent infinite loading
        loadingTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('⏱️ Camera loading timeout (3s) - forcing loading to false')
            setLoading(false)
          }
        }, 3000)

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

        console.log('✅ Camera stream obtained')

        if (!mounted) {
          // Component unmounted during setup, cleanup and exit
          mediaStream.getTracks().forEach((track) => track.stop())
          clearTimeout(loadingTimeout)
          return
        }

        // Store stream immediately (attachment will happen in separate useEffect)
        setStream(mediaStream)

        // Stream obtained successfully - attachment happens in separate useEffect
        clearTimeout(loadingTimeout)
        setLoading(false)
      } catch (err) {
        console.error('Camera error:', err)
        if (mounted) {
          setError('Camera access denied. Please allow camera permissions.')
          clearTimeout(loadingTimeout)
          setLoading(false)
        }
      }
    }

    initCamera()

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
      // Use videoRef to get current stream for cleanup
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [])

  // Separate effect: Attach stream to video element when both are ready
  useEffect(() => {
    if (!stream || !videoRef.current) {
      console.log('⏸️ Waiting for stream and video element:', {
        hasStream: !!stream,
        hasVideoRef: !!videoRef.current
      })
      return
    }

    console.log('📹 Attaching stream to video element...')
    const video = videoRef.current

    // Only set if not already set (prevents re-setting on re-renders)
    if (video.srcObject !== stream) {
      video.srcObject = stream

      // Wait for metadata to load, then play
      video.onloadedmetadata = () => {
        console.log('📹 Video metadata loaded, attempting to play...')
        video.play()
          .then(() => {
            console.log('✅ Video playing successfully:', {
              readyState: video.readyState,
              width: video.videoWidth,
              height: video.videoHeight,
              paused: video.paused
            })
          })
          .catch(err => {
            console.warn('⚠️ Autoplay blocked (this is normal):', err.message)
            console.log('📺 Video will play when user interacts with the page')
          })
      }

      // Fallback: If metadata already loaded, play immediately
      if (video.readyState >= 2) {
        console.log('📹 Video metadata already loaded, playing now...')
        video.play().catch(err => {
          console.warn('⚠️ Autoplay blocked:', err.message)
        })
      }
    }

    // Cleanup function
    return () => {
      if (video) {
        video.onloadedmetadata = null
      }
    }
  }, [stream])

  return { stream, error, loading, videoRef }
}
