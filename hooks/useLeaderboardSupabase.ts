'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, LeaderboardEntry } from '@/lib/supabase/client';

export function useLeaderboardSupabase() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [shownEntryIds, setShownEntryIds] = useState<string[]>([]);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      // Calculate timestamp for 24 hours ago
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // Build query - exclude already shown entries
      let query = supabase
        .from('leaderboard')
        .select('*')
        .gte('created_at', twentyFourHoursAgo.toISOString()) // Only last 24 hours
        .order('smile_percentage', { ascending: false });

      // Exclude already shown IDs
      if (shownEntryIds.length > 0) {
        query = query.not('id', 'in', `(${shownEntryIds.join(',')})`);
      }

      const { data, error } = await query.limit(5);

      if (error) throw error;

      // If no new entries found, reset the rotation cycle
      if (!data || data.length === 0) {
        console.log('🔄 No more new entries - resetting rotation cycle');
        setShownEntryIds([]); // Reset shown list

        // Fetch from beginning again
        const { data: resetData, error: resetError } = await supabase
          .from('leaderboard')
          .select('*')
          .gte('created_at', twentyFourHoursAgo.toISOString())
          .order('smile_percentage', { ascending: false })
          .limit(5);

        if (resetError) throw resetError;
        console.log(`✅ Reset: Fetched ${resetData?.length || 0} top smiles`);
        setEntries(resetData || []);
      } else {
        console.log(`✅ Fetched ${data.length} new top smiles (excluding ${shownEntryIds.length} already shown)`);
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [shownEntryIds]);

  const rotateToNextBatch = useCallback(() => {
    // Add current entry IDs to shown list
    setShownEntryIds(prev => {
      const currentIds = entries.map(e => e.id);
      return [...prev, ...currentIds];
    });
  }, [entries]);

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard();

    // Auto-refresh every 30 seconds (to get new entries as they come)
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing leaderboard...');
      fetchLeaderboard();
    }, 30000); // 30 seconds

    // Rotate to next batch every 10 minutes
    rotationTimerRef.current = setInterval(() => {
      console.log('🔄 Rotating to next top 5 smiles...');
      rotateToNextBatch();
    }, 600000); // 10 minutes = 600,000ms

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
          console.log('📨 Real-time update received:', payload.new);
          // Fetch fresh data to maintain proper rotation
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      clearInterval(refreshInterval);
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard, rotateToNextBatch]);

  // Trigger fetch when shownEntryIds changes (after rotation)
  useEffect(() => {
    if (shownEntryIds.length > 0) {
      fetchLeaderboard();
    }
  }, [shownEntryIds, fetchLeaderboard]);

  return { entries, loading };
}
