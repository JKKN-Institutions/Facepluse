'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
import { FaceAnalysis } from '@/types/face';

export function useFaceDetection(
  analysis: FaceAnalysis | null,
  videoRef: RefObject<HTMLVideoElement | null>
) {
  const [facePresent, setFacePresent] = useState(true);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [lastFaceImage, setLastFaceImage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCaptureRef = useRef<string | null>(null);

  // Function to manually trigger exit popup
  const manualEndSession = () => {
    // Capture current frame if available
    const capturedImage = captureFrame();
    if (capturedImage) {
      setLastFaceImage(capturedImage);
    } else if (lastCaptureRef.current) {
      setLastFaceImage(lastCaptureRef.current);
    }

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show exit popup immediately
    setShowExitPopup(true);
  };

  // Function to capture current video frame
  const captureFrame = () => {
    if (!videoRef?.current) return null;

    try {
      const video = videoRef.current;

      // Make sure video is ready (readyState >= 3 means HAVE_FUTURE_DATA or better)
      if (video.readyState < 3) return null;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error capturing frame:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!analysis) return;

    if (analysis.face_detected) {
      setFacePresent(true);
      setShowExitPopup(false);

      // Capture and store the last face image when face is present
      const capturedImage = captureFrame();
      if (capturedImage) {
        lastCaptureRef.current = capturedImage;
      }

      // Clear timeout if face reappears
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      setFacePresent(false);

      // Show popup after 1.5 seconds of no face (faster response)
      timeoutRef.current = setTimeout(() => {
        // Use the last captured image when showing popup
        if (lastCaptureRef.current) {
          setLastFaceImage(lastCaptureRef.current);
        }
        setShowExitPopup(true);
      }, 1500);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [analysis?.face_detected]);

  return { facePresent, showExitPopup, setShowExitPopup, lastFaceImage, manualEndSession };
}
