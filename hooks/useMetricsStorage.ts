'use client';

import { useEffect, useRef, useState, RefObject } from 'react';
import { supabase, Metric } from '@/lib/supabase/client';
import { FaceAnalysis } from '@/types/face';

export function useMetricsStorage(
  sessionId: string | null,
  analysis: FaceAnalysis | null,
  blinkCount: number,
  videoRef: RefObject<HTMLVideoElement | null>
) {
  const [lastMetric, setLastMetric] = useState<Metric | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout>();

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

  useEffect(() => {
    if (!sessionId || !analysis) return;

    // Save metrics every 2 seconds
    saveIntervalRef.current = setInterval(() => {
      saveMetric(sessionId, analysis, blinkCount);
    }, 2000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [sessionId, analysis, blinkCount]);

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
    } catch (error) {
      console.error('Error saving metric:', error);
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
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting last metric:', error);
      return null;
    }
  };

  return { lastMetric, getLastMetric };
}
