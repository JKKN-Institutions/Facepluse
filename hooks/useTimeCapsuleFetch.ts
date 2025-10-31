'use client';

import { useState, useCallback } from 'react';
import { supabase, Metric, TimeCapsuleEvent } from '@/lib/supabase/client';
import { EmotionalMoment, TimeCapsule, TimeCapsuleStatistics } from '@/types/timeCapsule';
import { Emotion } from '@/lib/emotion-themes';

/**
 * Generate a placeholder image for metrics without photos
 * Creates a colorful canvas with emotion emoji and smile percentage
 */
function generatePlaceholderImage(emotion: Emotion, smilePercentage: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Emotion-based color schemes
  const colorSchemes: Record<Emotion, { bg: string; accent: string }> = {
    happy: { bg: '#FEF3C7', accent: '#F59E0B' },      // Amber
    sad: { bg: '#DBEAFE', accent: '#3B82F6' },         // Blue
    surprised: { bg: '#FCE7F3', accent: '#EC4899' },   // Pink
    angry: { bg: '#FEE2E2', accent: '#EF4444' },       // Red
    neutral: { bg: '#F3F4F6', accent: '#6B7280' },     // Gray
  };

  const colors = colorSchemes[emotion] || colorSchemes.neutral;

  // Draw background gradient
  const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 200);
  gradient.addColorStop(0, colors.bg);
  gradient.addColorStop(1, colors.accent + '40');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 400);

  // Draw emotion emoji
  const emojis: Record<Emotion, string> = {
    happy: '😊',
    sad: '😢',
    surprised: '😲',
    angry: '😠',
    neutral: '😐',
  };

  ctx.font = 'bold 180px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emojis[emotion] || '😐', 200, 180);

  // Draw smile percentage badge
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.roundRect(100, 280, 200, 60, 15);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText(`${Math.round(smilePercentage)}%`, 200, 310);

  // Draw emotion label
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText(emotion.toUpperCase(), 200, 370);

  return canvas.toDataURL('image/png');
}

export function useTimeCapsuleFetch() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch images from Supabase based on time range
  const fetchImagesFromTimeRange = useCallback(async (
    startTime: string,
    endTime: string,
    includeChallenges: boolean = false
  ): Promise<EmotionalMoment[]> => {
    try {
      console.log('🔍 Fetching images from', startTime, 'to', endTime);

      // Fetch metrics from the time range
      // Note: We fetch ALL metrics, even without images, to enable placeholder generation
      const { data: metrics, error } = await supabase
        .from('metrics')
        .select('*')
        .gte('created_at', startTime)
        .lte('created_at', endTime)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const metricsWithImages = metrics?.filter(m => m.image_url) || [];
      const metricsWithoutImages = metrics?.filter(m => !m.image_url) || [];

      console.log(`✅ Found ${metrics?.length || 0} captured moments`);
      console.log(`   📸 ${metricsWithImages.length} with images, 🎨 ${metricsWithoutImages.length} without (will use placeholders)`);

      // Convert Metric[] to EmotionalMoment[]
      const moments: EmotionalMoment[] = (metrics || []).map(metric => ({
        id: metric.id,
        timestamp: new Date(metric.created_at).getTime(),
        emotion: metric.emotion as Emotion,
        confidence: metric.emotion_confidence,
        // If no image URL, generate placeholder
        imageData: metric.image_url || generatePlaceholderImage(
          metric.emotion as Emotion,
          metric.smile_percentage
        ),
        smilePercentage: metric.smile_percentage,
        metadata: {
          eventId: '', // Will be filled later
          userId: metric.session_id,
        },
      }));

      // TODO: Optionally fetch emoji challenge images if includeChallenges is true
      // This would require a separate table for challenge captures

      return moments;

    } catch (error) {
      console.error('❌ Error fetching images:', error);
      return [];
    }
  }, []);

  // Calculate statistics from moments
  const calculateStatistics = useCallback((moments: EmotionalMoment[], startTime: number, endTime: number): TimeCapsuleStatistics => {
    if (moments.length === 0) {
      return {
        totalMoments: 0,
        emotionDistribution: {
          happy: 0,
          sad: 0,
          surprised: 0,
          angry: 0,
          neutral: 0,
        },
        averageSmile: 0,
        peakHappiness: null,
        mostCommonEmotion: 'neutral',
        duration: 0,
      };
    }

    // Calculate emotion distribution
    const emotionCounts: Record<Emotion, number> = {
      happy: 0,
      sad: 0,
      surprised: 0,
      angry: 0,
      neutral: 0,
    };

    moments.forEach(m => {
      emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
    });

    // Find most common emotion
    const mostCommonEmotion = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as Emotion || 'neutral';

    // Calculate average smile
    const totalSmile = moments.reduce((sum, m) => sum + m.smilePercentage, 0);
    const averageSmile = Math.round(totalSmile / moments.length);

    // Find peak happiness moment
    const peakHappiness = moments.reduce((max, m) =>
      m.smilePercentage > max.smilePercentage ? m : max
    , moments[0]);

    // Calculate duration in seconds
    const duration = Math.floor((endTime - startTime) / 1000);

    return {
      totalMoments: moments.length,
      emotionDistribution: emotionCounts,
      averageSmile,
      peakHappiness,
      mostCommonEmotion,
      duration,
    };
  }, []);

  // Generate collage from Supabase event
  const generateCollageFromEvent = useCallback(async (event: TimeCapsuleEvent): Promise<string | null> => {
    if (!event.end_time) {
      throw new Error('Event must be stopped before generating collage');
    }

    setIsGenerating(true);

    try {
      // Fetch images from time range
      const moments = await fetchImagesFromTimeRange(
        event.start_time,
        event.end_time,
        event.include_challenges
      );

      if (moments.length === 0) {
        throw new Error('No moments captured during this time period. Make sure facial analysis was running during the event.');
      }

      console.log(`🎨 Generating collage with ${moments.length} moments...`);

      // Provide feedback for large image counts
      if (moments.length > 200) {
        console.warn(`⚠️ Large image count (${moments.length}). Photos will be scaled to 100px for optimal viewing.`);
      } else if (moments.length > 100) {
        console.log(`📊 Medium image count (${moments.length}). Photos will be scaled to 120px.`);
      }

      // Calculate statistics
      const startTime = new Date(event.start_time).getTime();
      const endTime = new Date(event.end_time).getTime();
      const statistics = calculateStatistics(moments, startTime, endTime);

      // Create TimeCapsule object for collage generation
      const capsule: TimeCapsule = {
        id: event.id,
        eventId: event.id,
        eventName: event.name,
        eventDescription: event.description,
        startTime,
        endTime,
        moments,
        statistics,
      };

      // Import and generate collage
      const { generateCollage: generateCollageImage } = await import('@/lib/collageGenerator');
      const collageDataUrl = await generateCollageImage(capsule);

      console.log('✅ Collage generated successfully');
      return collageDataUrl;

    } catch (error) {
      console.error('❌ Failed to generate collage:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [fetchImagesFromTimeRange, calculateStatistics]);

  return {
    isGenerating,
    fetchImagesFromTimeRange,
    generateCollageFromEvent,
  };
}
