'use client';

import { useEffect, useRef, useState, RefObject } from 'react';
import { supabase, Metric } from '@/lib/supabase/client';
import { FaceAnalysis } from '@/types/face';
import { uploadImage } from '@/lib/supabase/uploadImage';

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
    // Skip if using temporary session ID
    if (sessionId.startsWith('temp-')) {
      console.log('⚠️ Skipping metric save for temporary session:', sessionId);
      return null;
    }

    try {
      console.log('🔵 Attempting to save metric:', {
        sessionId,
        emotion: analysis.emotion,
        smile: analysis.smile_percentage
      });

      // Capture and upload image to Supabase Storage
      const frameData = captureFrame();
      let imageUrl: string | null = null;

      if (frameData) {
        console.log('📸 Uploading captured image...');
        imageUrl = await uploadImage(frameData, 'mood-captures');
        if (imageUrl) {
          console.log('✅ Image uploaded:', imageUrl);
        } else {
          console.warn('⚠️ Image upload failed, continuing without image');
        }
      }

      const { data, error} = await supabase
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
          image_url: imageUrl, // Add uploaded image URL
        })
        .select()
        .single();

      if (error) {
        console.error('🔴 Supabase error saving metric:', error);
        throw error;
      }

      console.log('🟢 Metric saved successfully with image:', data);
      setLastMetric(data);

      // Update leaderboard if high smile
      if (analysis.smile_percentage >= 70) {
        const screenshot = captureFrame();

        const { error: leaderboardError } = await supabase
          .from('leaderboard')
          .insert({
            session_id: sessionId,
            smile_percentage: Math.round(analysis.smile_percentage),
            emotion: analysis.emotion,
            screenshot_url: screenshot,
          });

        if (leaderboardError) {
          console.error('🟡 Leaderboard save failed (non-critical):', leaderboardError);
        }
      }

      // Return the saved metric data
      return data;
    } catch (error: any) {
      console.error('🔴 Error saving metric (full error):', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      return null;
    }
  };

  const getLastMetric = async (sessionId: string) => {
    // Skip if using temporary session ID
    if (sessionId.startsWith('temp-')) {
      console.log('⚠️ Skipping metric fetch for temporary session:', sessionId);
      return null;
    }

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
