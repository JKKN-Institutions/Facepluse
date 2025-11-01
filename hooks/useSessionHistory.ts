'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase/client';

interface Session {
  id: string;
  created_at: string;
  avg_smile: number;
  total_duration: number;
  total_blinks: number;
  dominant_emotion: string;
}

// Optimized fetcher using database function (single query instead of N+1)
const fetchSessions = async (): Promise<Session[]> => {
  try {
    const { data, error } = await supabase.rpc('get_sessions_with_metrics', {
      limit_count: 20
    });

    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

export function useSessionHistory() {
  // Use SWR for caching and automatic revalidation
  const { data: sessions, error, isLoading } = useSWR<Session[]>(
    'session-history',
    fetchSessions,
    {
      // Cache for 2 minutes
      dedupingInterval: 120000,
      // Don't revalidate on focus (reduces unnecessary requests)
      revalidateOnFocus: false,
      // Revalidate when window regains focus after 30 seconds
      focusThrottleInterval: 30000,
      // Keep previous data while revalidating
      keepPreviousData: true,
    }
  );

  return {
    sessions: sessions || [],
    loading: isLoading,
    error,
  };
}
