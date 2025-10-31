'use client'

import { useState, useEffect, RefObject, useRef } from 'react'
import { FaceAnalysis } from '@/types/face'
import * as faceapi from 'face-api.js'
import { useTheme } from '@/contexts/ThemeContext'
import { Emotion, isValidEmotion } from '@/lib/emotion-themes'

export function useFaceAnalysis(videoRef: RefObject<HTMLVideoElement | null>) {
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [blinkCount, setBlinkCount] = useState(0)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [faceDetection, setFaceDetection] = useState<faceapi.WithFaceLandmarks<{detection: faceapi.FaceDetection}, faceapi.FaceLandmarks68> | null>(null)
  const lastEyeState = useRef<'open' | 'closed'>('open')
  const blinkFrameCount = useRef(0)

  // Get theme context for dynamic emotion-based themes
  const { setEmotion } = useTheme()
  const lastEmotionRef = useRef<string | null>(null)

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Loading face-api.js models...')
        const MODEL_URL = '/models'

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ])

        console.log('All face-api.js models loaded successfully!')
        setModelsLoaded(true)
      } catch (error) {
        console.error('Error loading face-api.js models:', error)
      }
    }

    loadModels()
  }, [])

  // Detect blinks based on eye landmarks
  const detectBlink = (landmarks: faceapi.FaceLandmarks68) => {
    try {
      // Get eye landmarks
      const leftEye = landmarks.getLeftEye()
      const rightEye = landmarks.getRightEye()

      // Calculate eye aspect ratio (EAR) for blink detection
      const getEyeAspectRatio = (eye: faceapi.Point[]) => {
        if (eye.length < 6) return 1

        // Vertical eye landmarks
        const v1 = Math.sqrt(
          Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2)
        )
        const v2 = Math.sqrt(
          Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2)
        )

        // Horizontal eye landmarks
        const h = Math.sqrt(
          Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2)
        )

        return (v1 + v2) / (2.0 * h)
      }

      const leftEAR = getEyeAspectRatio(leftEye)
      const rightEAR = getEyeAspectRatio(rightEye)
      const avgEAR = (leftEAR + rightEAR) / 2

      // EAR threshold for blink detection (increased for better sensitivity)
      const EAR_THRESHOLD = 0.23
      const currentEyeState = avgEAR < EAR_THRESHOLD ? 'closed' : 'open'

      // Require at least 1 frame to confirm blink (100ms at current interval)
      if (currentEyeState === 'closed') {
        blinkFrameCount.current++
      } else {
        // Eyes opened - check if we had a blink
        if (blinkFrameCount.current >= 1 && lastEyeState.current === 'closed') {
          setBlinkCount((prev) => prev + 1)
        }
        blinkFrameCount.current = 0
      }

      lastEyeState.current = currentEyeState
      return currentEyeState === 'closed'
    } catch (error) {
      return false
    }
  }

  // Analyze face from video
  useEffect(() => {
    if (!modelsLoaded) return

    const interval = setInterval(async () => {
      if (!videoRef.current || analyzing || videoRef.current.readyState !== 4) return

      setAnalyzing(true)

      try {
        // Detect face with all features (improved accuracy settings)
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 608,      // Higher = better accuracy (was 416)
              scoreThreshold: 0.3  // Lower = detects faces easier (was 0.5)
            })
          )
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender()

        if (detections) {
          // Extract expressions
          const expressions = detections.expressions
          const dominantExpression = expressions.asSortedArray()[0]

          // Map face-api.js expressions to our emotion types
          const emotionMap: Record<string, FaceAnalysis['emotion']> = {
            happy: 'happy',
            sad: 'sad',
            angry: 'angry',
            surprised: 'surprised',
            neutral: 'neutral',
            fearful: 'sad',
            disgusted: 'angry',
          }

          const emotion = emotionMap[dominantExpression.expression] || 'neutral'
          const emotionConfidence = Math.round(dominantExpression.probability * 100)

          // Detect head pose and smile from landmarks
          const landmarks = detections.landmarks

          // Calculate smile using mouth landmarks
          const mouth = landmarks.getMouth()
          const leftMouth = mouth[0]
          const rightMouth = mouth[6]
          const topLip = mouth[3]
          const bottomLip = mouth[9]

          const mouthWidth = Math.abs(rightMouth.x - leftMouth.x)
          const mouthHeight = Math.abs(bottomLip.y - topLip.y)
          const mouthRatio = mouthHeight / mouthWidth

          // Combine mouth geometry with happy expression for better accuracy
          const happyScore = expressions.happy * 100
          const mouthSmileScore = Math.min(mouthRatio * 150, 100) // Scale to 0-100

          // Weighted average (60% expression, 40% mouth shape)
          const smilePercentage = Math.round(happyScore * 0.6 + mouthSmileScore * 0.4)

          // Get age
          const age = Math.round(detections.age)

          // Calculate head angle from jaw and nose position
          const jaw = landmarks.getJawOutline()
          const nose = landmarks.getNose()
          const leftJaw = jaw[0]
          const rightJaw = jaw[jaw.length - 1]
          const noseCenter = nose[3]

          const jawWidth = rightJaw.x - leftJaw.x
          const noseOffset = noseCenter.x - (leftJaw.x + jawWidth / 2)
          const headAngle = (noseOffset / jawWidth) * 100

          let headPose: 'left' | 'center' | 'right' = 'center'
          if (headAngle < -15) headPose = 'left'
          else if (headAngle > 15) headPose = 'right'

          // Detect blink
          const blinkDetected = detectBlink(landmarks)

          setAnalysis({
            face_detected: true,
            smile_percentage: smilePercentage,
            emotion,
            emotion_confidence: emotionConfidence,
            age_estimate: age,
            blink_detected: blinkDetected,
            head_pose: headPose,
          })

          // Update global theme based on detected emotion (only if emotion changed)
          if (emotion !== lastEmotionRef.current && isValidEmotion(emotion)) {
            console.log('🎨 Updating theme to:', emotion)
            setEmotion(emotion as Emotion)
            lastEmotionRef.current = emotion
          }

          // Store full detection data for face shape overlay
          setFaceDetection(detections)

          // Debug logging to see detection status
          console.log('✅ Face detected:', {
            smile: smilePercentage,
            emotion,
            age,
            confidence: emotionConfidence,
            timestamp: new Date().toISOString()
          })
        } else {
          // No face detected
          console.log('❌ No face detected')
          setAnalysis({
            face_detected: false,
            smile_percentage: 0,
            emotion: 'neutral',
            emotion_confidence: 0,
            age_estimate: 0,
            blink_detected: false,
            head_pose: 'center',
          })
          setFaceDetection(null)
        }
      } catch (error) {
        console.error('Face analysis failed:', error)
        // Keep previous analysis on error
      } finally {
        setAnalyzing(false)
      }
    }, 100) // Analyze every 100ms for faster blink detection

    return () => clearInterval(interval)
  }, [videoRef, analyzing, modelsLoaded])

  return { analysis, analyzing, blinkCount, faceDetection }
}
