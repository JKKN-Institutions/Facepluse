'use client';

import { useEffect, useRef, useState, RefObject } from 'react';
import { supabase, Metric } from '@/lib/supabase/client';
import { FaceAnalysis } from '@/types/face';

export function useMetricsStorage(
  sessionId: string | null,
  analysis: FaceAnalysis | null,
  blinkCount: number,
  videoRef: RefObject<HTMLVideoElement | null>,
  enableContinuousStorage: boolean = false
) {
  const [lastMetric, setLastMetric] = useState<Metric | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Function to capture current video frame
  const captureFrame = (): string | null => {
    if (!videoRef?.current) return null;

    try {
      const video = videoRef.current;
      if (video.readyState !== 4) return null;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.7); // 70% quality for smaller size
    } catch (error) {
      console.error('Error capturing frame:', error);
      return null;
    }
  };

  const saveMetric = async (sessionId: string, analysis: FaceAnalysis, blinkCount: number) => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .insert({
          session_id: sessionId,
          smile_percentage: Math.round(analysis.smile_percentage),
          emotion: analysis.emotion,
          emotion_confidence: Math.round(analysis.emotion_confidence),
          age_estimate: Math.round(analysis.age_estimate || 0),
          blink_count: blinkCount,
          head_pose: analysis.head_pose,
          face_detected: analysis.face_detected,
        })
        .select()
        .single();

      if (error) throw error;
      setLastMetric(data);

      // Update leaderboard if high smile
      if (analysis.smile_percentage >= 70) {
        const screenshot = captureFrame();

        await supabase
          .from('leaderboard')
          .insert({
            session_id: sessionId,
            smile_percentage: Math.round(analysis.smile_percentage),
            emotion: analysis.emotion,
            screenshot_url: screenshot,
          });
      }

      // Return the saved metric data
      return data;
    } catch (error) {
      console.error('Error saving metric:', error);
      return null;
    }
  };

  const getLastMetric = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting last metric:', error);
      return null;
    }
  };

  const captureOnce = async () => {
    if (!sessionId || !analysis) return null;
    return await saveMetric(sessionId, analysis, blinkCount);
  };

  // Continuous metric storage (every 3 seconds when face detected)
  useEffect(() => {
    if (!enableContinuousStorage || !sessionId) {
      // Clean up if disabled
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = undefined;
      }
      return;
    }

    // Clear any existing interval
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    // Save metrics every 3 seconds
    console.log('✅ Continuous metric storage enabled for session:', sessionId);
    saveIntervalRef.current = setInterval(() => {
      if (analysis?.face_detected) {
        console.log('💾 Saving metric - Smile:', analysis.smile_percentage, 'Emotion:', analysis.emotion);
        saveMetric(sessionId, analysis, blinkCount);
      }
    }, 3000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = undefined;
      }
    };
  }, [enableContinuousStorage, sessionId, analysis, blinkCount]);

  return { lastMetric, getLastMetric, captureOnce };
}
