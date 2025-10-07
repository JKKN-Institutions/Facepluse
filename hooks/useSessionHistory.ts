'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Session {
  id: string;
  created_at: string;
  avg_smile: number;
  total_duration: number;
  total_blinks: number;
  dominant_emotion: string;
}

export function useSessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      // Fetch sessions ordered by most recent first
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('id, created_at, total_duration')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!sessionsData) {
        setSessions([]);
        return;
      }

      // Fetch metrics for each session to calculate aggregated data
      const sessionsWithMetrics = await Promise.all(
        sessionsData.map(async (session) => {
          const { data: metricsData } = await supabase
            .from('metrics')
            .select('smile_percentage, blink_count, emotion')
            .eq('session_id', session.id);

          // Calculate average smile
          const avg_smile = metricsData && metricsData.length > 0
            ? Math.round(
                metricsData.reduce((sum, m) => sum + (m.smile_percentage || 0), 0) / metricsData.length
              )
            : 0;

          // Get max blink count
          const total_blinks = metricsData && metricsData.length > 0
            ? Math.max(...metricsData.map(m => m.blink_count || 0))
            : 0;

          // Find dominant emotion (most common)
          const emotionCounts: Record<string, number> = {};
          metricsData?.forEach(m => {
            const emotion = m.emotion || 'neutral';
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          });

          const dominant_emotion = Object.keys(emotionCounts).length > 0
            ? Object.entries(emotionCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
            : 'neutral';

          return {
            id: session.id,
            created_at: session.created_at,
            avg_smile,
            total_duration: session.total_duration || 0,
            total_blinks,
            dominant_emotion,
          };
        })
      );

      setSessions(sessionsWithMetrics);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  return { sessions, loading };
}
