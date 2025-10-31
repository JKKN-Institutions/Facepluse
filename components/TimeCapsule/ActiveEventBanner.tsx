'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TimeCapsuleEvent } from '@/lib/supabase/client';
import { Clock, Square } from 'lucide-react';

interface ActiveEventBannerProps {
  event: TimeCapsuleEvent;
  onStop: () => void;
}

export function ActiveEventBanner({ event, onStop }: ActiveEventBannerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const startTime = new Date(event.start_time).getTime();
    const endTime = event.end_time ? new Date(event.end_time).getTime() : null;

    const updateElapsed = () => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      setElapsed(Math.floor(elapsedMs / 1000)); // Convert to seconds

      // Check if event expired
      if (endTime && now >= endTime) {
        setIsExpired(true);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [event]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    if (!event.end_time) return null;
    const endTime = new Date(event.end_time).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    return formatTime(remaining);
  };

  const remaining = getRemainingTime();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-premium rounded-2xl p-6 shadow-xl border-2 ${
        isExpired ? 'border-yellow-500 bg-yellow-50/50' : 'border-emerald-500 bg-emerald-50/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${isExpired ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'}`} />
            <h3 className="text-lg font-bold text-gray-800">
              {isExpired ? '⏰ Event Completed' : '🎬 Recording Active'}
            </h3>
          </div>

          <p className="text-2xl font-bold text-gray-900 mb-1">{event.name}</p>
          {event.description && (
            <p className="text-sm text-gray-600 mb-3">{event.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="font-mono text-lg font-semibold text-emerald-700">
                {formatTime(elapsed)}
              </span>
              <span className="text-gray-500">elapsed</span>
            </div>

            {remaining !== null && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <span className={`font-mono text-lg font-semibold ${isExpired ? 'text-yellow-700' : 'text-gray-700'}`}>
                  {remaining}
                </span>
                <span className="text-gray-500">{isExpired ? 'overtime' : 'remaining'}</span>
              </div>
            )}
          </div>

          {isExpired && (
            <div className="mt-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3">
              <p className="text-sm text-yellow-800 font-semibold">
                🎉 Time's up! Stop the event to generate your collage.
              </p>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStop}
          className="ml-4 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2 shadow-lg"
        >
          <Square className="w-5 h-5" />
          Stop Event
        </motion.button>
      </div>
    </motion.div>
  );
}
