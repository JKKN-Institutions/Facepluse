'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useAnalyticsData() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgSmile: 0,
    totalDuration: 0,
    happinessIndex: 0,
    smileTrends: { labels: [] as string[], data: [] as number[] },
    emotionDistribution: {} as Record<string, number>,
    weeklyData: {
      labels: [] as string[],
      smileScores: [] as number[],
      emotionConfidence: [] as number[]
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch total sessions count
      const { count: totalSessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true });

      // Fetch all metrics for calculations
      const { data: metricsData } = await supabase
        .from('metrics')
        .select('smile_percentage, emotion, emotion_confidence, created_at')
        .order('created_at', { ascending: false });

      // Fetch total duration from sessions
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('total_duration, created_at');

      // Calculate average smile
      const avgSmile = metricsData && metricsData.length > 0
        ? Math.round(
            metricsData.reduce((sum, m) => sum + (m.smile_percentage || 0), 0) / metricsData.length
          )
        : 0;

      // Calculate total duration (in hours)
      const totalDuration = sessionsData && sessionsData.length > 0
        ? Math.round(
            sessionsData.reduce((sum, s) => sum + (s.total_duration || 0), 0) / 3600
          )
        : 0;

      // Calculate happiness index (percentage of happy emotions * 10)
      const happyCount = metricsData?.filter(m => m.emotion?.toLowerCase() === 'happy').length || 0;
      const totalMetrics = metricsData?.length || 1;
      const happinessIndex = Number(((happyCount / totalMetrics) * 10).toFixed(1));

      // Calculate emotion distribution
      const emotionDistribution: Record<string, number> = {};
      metricsData?.forEach(m => {
        const emotion = m.emotion || 'Unknown';
        emotionDistribution[emotion] = (emotionDistribution[emotion] || 0) + 1;
      });

      // Convert to percentages
      Object.keys(emotionDistribution).forEach(key => {
        emotionDistribution[key] = Math.round((emotionDistribution[key] / totalMetrics) * 100);
      });

      // Calculate smile trends by day of week (last 7 days)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const smileTrendsByDay: Record<number, number[]> = {};
      const emotionConfidenceByDay: Record<number, number[]> = {};

      metricsData?.forEach(m => {
        const date = new Date(m.created_at);
        const dayIndex = date.getDay();

        if (!smileTrendsByDay[dayIndex]) {
          smileTrendsByDay[dayIndex] = [];
          emotionConfidenceByDay[dayIndex] = [];
        }

        if (m.smile_percentage !== null) {
          smileTrendsByDay[dayIndex].push(m.smile_percentage);
        }
        if (m.emotion_confidence !== null) {
          emotionConfidenceByDay[dayIndex].push(m.emotion_confidence);
        }
      });

      const smileTrendsData = last7Days.map(date => {
        const dayIndex = date.getDay();
        const values = smileTrendsByDay[dayIndex] || [];
        return values.length > 0
          ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
          : 0;
      });

      const emotionConfidenceData = last7Days.map(date => {
        const dayIndex = date.getDay();
        const values = emotionConfidenceByDay[dayIndex] || [];
        return values.length > 0
          ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
          : 0;
      });

      const weeklyLabels = last7Days.map(date => dayNames[date.getDay()]);

      setStats({
        totalSessions: totalSessions || 0,
        avgSmile,
        totalDuration,
        happinessIndex,
        smileTrends: {
          labels: weeklyLabels,
          data: smileTrendsData,
        },
        emotionDistribution,
        weeklyData: {
          labels: weeklyLabels,
          smileScores: smileTrendsData,
          emotionConfidence: emotionConfidenceData,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
}
