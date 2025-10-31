'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, TimeCapsuleEvent } from '@/lib/supabase/client';

export function useTimeCapsuleEvents() {
  const [events, setEvents] = useState<TimeCapsuleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<TimeCapsuleEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all events for current user
  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('time_capsule_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Supabase error:', fetchError);

        // Check if table doesn't exist
        if (fetchError.code === 'PGRST116' ||
            fetchError.message?.includes('does not exist') ||
            fetchError.message?.includes('relation') ||
            fetchError.message?.includes('schema cache') ||
            fetchError.message?.includes('time_capsule_events') ||
            fetchError.code === '42P01') {
          setError('database_not_setup');
          console.error('🔴 Database table "time_capsule_events" does not exist. Please run migrations.');
        } else {
          setError(fetchError.message || 'Failed to fetch events');
        }

        setEvents([]); // Set empty array instead of undefined
        setActiveEvent(null);
        return;
      }

      console.log(`✅ Fetched ${data?.length || 0} Time Capsule events`);
      setEvents(data || []);

      // Check if there's an active event (no end_time)
      const active = data?.find(e => !e.end_time);
      setActiveEvent(active || null);

    } catch (error: any) {
      console.error('❌ Error fetching events:', error);
      setError(error?.message || 'Unknown error');
      setEvents([]);
      setActiveEvent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new event
  const createEvent = useCallback(async (
    name: string,
    description: string = '',
    includeChallenges: boolean = false,
    durationMinutes?: number
  ): Promise<TimeCapsuleEvent | null> => {
    try {
      const startTime = new Date().toISOString();

      // Calculate end time if duration provided
      let endTime: string | undefined;
      if (durationMinutes) {
        const end = new Date();
        end.setMinutes(end.getMinutes() + durationMinutes);
        endTime = end.toISOString();
      }

      const { data, error } = await supabase
        .from('time_capsule_events')
        .insert({
          name,
          description,
          start_time: startTime,
          end_time: endTime,
          include_challenges: includeChallenges,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Event created:', data);

      // If no duration, set as active event
      if (!durationMinutes) {
        setActiveEvent(data);
      }

      await fetchEvents();
      return data;

    } catch (error) {
      console.error('❌ Error creating event:', error);
      return null;
    }
  }, [fetchEvents]);

  // Stop active event
  const stopEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('time_capsule_events')
        .update({ end_time: new Date().toISOString() })
        .eq('id', eventId);

      if (error) throw error;

      console.log('✅ Event stopped:', eventId);
      setActiveEvent(null);
      await fetchEvents();
      return true;

    } catch (error) {
      console.error('❌ Error stopping event:', error);
      return false;
    }
  }, [fetchEvents]);

  // Update event with collage URL
  const updateCollageUrl = useCallback(async (
    eventId: string,
    collageUrl: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('time_capsule_events')
        .update({ collage_url: collageUrl })
        .eq('id', eventId);

      if (error) throw error;

      console.log('✅ Collage URL updated for event:', eventId);
      await fetchEvents();
      return true;

    } catch (error) {
      console.error('❌ Error updating collage URL:', error);
      return false;
    }
  }, [fetchEvents]);

  // Delete event
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('time_capsule_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      console.log('✅ Event deleted:', eventId);
      await fetchEvents();
      return true;

    } catch (error) {
      console.error('❌ Error deleting event:', error);
      return false;
    }
  }, [fetchEvents]);

  // Get event by ID
  const getEvent = useCallback(async (eventId: string): Promise<TimeCapsuleEvent | null> => {
    try {
      const { data, error } = await supabase
        .from('time_capsule_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('❌ Error getting event:', error);
      return null;
    }
  }, []);

  // Check for expired events with end_time
  const checkExpiredEvents = useCallback(async () => {
    const now = new Date();
    const expiredEvents = events.filter(e => {
      if (!e.end_time || e.collage_url) return false;
      return new Date(e.end_time) <= now;
    });

    console.log(`⏰ Found ${expiredEvents.length} expired events ready for collage generation`);
    return expiredEvents;
  }, [events]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Check for expired events every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkExpiredEvents();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkExpiredEvents]);

  return {
    events,
    loading,
    error,
    activeEvent,
    createEvent,
    stopEvent,
    updateCollageUrl,
    deleteEvent,
    getEvent,
    fetchEvents,
    checkExpiredEvents,
  };
}
