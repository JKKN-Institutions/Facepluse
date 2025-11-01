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

        if (!mounted) {
          // Component unmounted during setup, cleanup and exit
          mediaStream.getTracks().forEach((track) => track.stop())
          clearTimeout(loadingTimeout)
          return
        }

        // Attach stream to video element
        if (videoRef.current) {
          const video = videoRef.current
          videoElement = video  // Store for cleanup
          eventListenersAdded = true

          // Guard to prevent multiple setLoading(false) calls
          let loadingSetToFalse = false
          const setLoadingFalse = () => {
            if (!loadingSetToFalse && mounted) {
              console.log('✅ Setting loading to false')
              loadingSetToFalse = true
              clearTimeout(loadingTimeout)
              setLoading(false)
            }
          }

          // Multiple event listeners for cross-browser compatibility
          const handleLoadedData = () => {
            console.log('📹 loadeddata event fired')
            setLoadingFalse()
          }

          const handleCanPlay = () => {
            console.log('📹 canplay event fired')
            setLoadingFalse()
          }

          const handlePlaying = () => {
            console.log('📹 playing event fired')
            setLoadingFalse()
          }

          // Helper to check if video is already ready
          const checkIfVideoReady = () => {
            if (video.readyState >= 3 && video.videoWidth > 0 && video.videoHeight > 0) {
              console.log('📹 Video already ready! readyState:', video.readyState, 'dimensions:', video.videoWidth, 'x', video.videoHeight)
              setLoadingFalse()
              return true
            }
            return false
          }

          // Set srcObject
          video.srcObject = mediaStream

          // Immediate check: Is video already ready?
          if (!checkIfVideoReady()) {
            console.log('⏳ Video not ready yet, adding event listeners...')

            // Only add listeners if video is not already ready
            video.addEventListener('loadeddata', handleLoadedData)
            video.addEventListener('canplay', handleCanPlay)
            video.addEventListener('playing', handlePlaying)
          }

          // Try to play the video
          try {
            await video.play()

            // Manual check: If play succeeded and video has dimensions, force loading false
            // This is a fallback in case none of the events fire reliably
            setTimeout(() => {
              if (mounted && video.videoWidth > 0 && video.videoHeight > 0) {
                console.log('📹 Manual check: Video dimensions ready', video.videoWidth, 'x', video.videoHeight)
                setLoadingFalse()
              }
            }, 100)

            // Forced fallback: After 500ms, force loading to false regardless
            // This prevents infinite loading if something unexpected happens
            setTimeout(() => {
              if (mounted && !loadingSetToFalse) {
                console.log('⚡ Forced fallback triggered after 500ms')
                setLoadingFalse()
              }
            }, 500)
          } catch (err) {
            console.error('Error playing video:', err)
            // Still try to set loading false even if autoplay fails
            setLoadingFalse()
          }
        } else {
          // Video ref not available yet, set loading false anyway
          clearTimeout(loadingTimeout)
          setLoading(false)
        }

        setStream(mediaStream)
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

  return { stream, error, loading, videoRef }
}
