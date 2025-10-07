'use client';

import { useState, useEffect } from 'react';
import { supabase, Session } from '@/lib/supabase/client';

export function useSupabaseSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);

  useEffect(() => {
    createSession();

    // End session on page unload
    const handleBeforeUnload = () => {
      if (sessionId) {
        endSession(sessionId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (sessionId) {
        endSession(sessionId);
      }
    };
  }, []);

  const createSession = async () => {
    try {
      console.log('🔵 Creating new session...');

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_agent: navigator.userAgent,
          device_type: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        })
        .select()
        .single();

      if (error) {
        console.error('🔴 Session creation error:', error);
        throw error;
      }

      console.log('🟢 Session created successfully:', { id: data.id, created_at: data.created_at });
      setSessionId(data.id);
      setSessionStart(new Date(data.created_at));
    } catch (error: any) {
      console.error('🔴 Error creating session (full error):', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (id: string) => {
    try {
      const { data: session } = await supabase
        .from('sessions')
        .select('created_at')
        .eq('id', id)
        .single();

      if (session) {
        const duration = Math.floor(
          (new Date().getTime() - new Date(session.created_at).getTime()) / 1000
        );

        await supabase
          .from('sessions')
          .update({
            ended_at: new Date().toISOString(),
            total_duration: duration,
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  return { sessionId, loading, sessionStart };
}
