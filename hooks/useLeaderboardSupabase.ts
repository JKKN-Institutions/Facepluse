'use client';

import { useState, useEffect } from 'react';
import { supabase, LeaderboardEntry } from '@/lib/supabase/client';

export function useLeaderboardSupabase() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leaderboard',
        },
        (payload) => {
          setEntries((prev) => {
            const newEntries = [payload.new as LeaderboardEntry, ...prev]
              .sort((a, b) => b.smile_percentage - a.smile_percentage)
              .slice(0, 10);
            return newEntries;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('smile_percentage', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return { entries, loading };
}
