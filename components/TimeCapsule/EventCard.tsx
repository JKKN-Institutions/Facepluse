'use client';

import { motion } from 'framer-motion';
import { TimeCapsule } from '@/types/timeCapsule';
import { Play, Trash2, Calendar, Clock, Smile, TrendingUp } from 'lucide-react';
import { emotionEmojis } from '@/lib/emotion-themes';

interface EventCardProps {
  event: TimeCapsule;
  onView: (event: TimeCapsule) => void;
  onDelete: (eventId: string) => void;
}

export function EventCard({ event, onView, onDelete }: EventCardProps) {
  const durationMinutes = Math.floor(event.statistics.duration / 60);
  const durationSeconds = event.statistics.duration % 60;
  const dateString = new Date(event.startTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-premium rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all theme-transition"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{event.eventName}</h3>
          {event.eventDescription && (
            <p className="text-sm text-gray-600 mb-2">{event.eventDescription}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dateString}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {durationMinutes}m {durationSeconds}s
            </span>
          </div>
        </div>

        {/* Delete Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(event.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{event.statistics.totalMoments}</p>
          <p className="text-xs text-gray-600">Moments</p>
        </div>
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <Smile className="w-4 h-4 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{event.statistics.averageSmile}%</p>
          </div>
          <p className="text-xs text-gray-600">Avg Happiness</p>
        </div>
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <p className="text-2xl">{emotionEmojis[event.statistics.mostCommonEmotion]}</p>
          <p className="text-xs text-gray-600 capitalize">{event.statistics.mostCommonEmotion}</p>
        </div>
      </div>

      {/* Emotion Distribution Bar */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">Emotion Distribution</p>
        <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
          {Object.entries(event.statistics.emotionDistribution).map(([emotion, count]) => {
            const percentage = (count / event.statistics.totalMoments) * 100;
            const colors: Record<string, string> = {
              happy: 'bg-yellow-400',
              sad: 'bg-blue-400',
              surprised: 'bg-pink-400',
              angry: 'bg-red-400',
              neutral: 'bg-gray-400',
            };

            return percentage > 0 ? (
              <div
                key={emotion}
                className={`${colors[emotion]} transition-all`}
                style={{ width: `${percentage}%` }}
                title={`${emotion}: ${count} moments`}
              />
            ) : null;
          })}
        </div>
      </div>

      {/* View Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onView(event)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
      >
        <Play className="w-4 h-4" />
        {(event as any).videoUrl ? 'Watch Montage' : 'View Details'}
      </motion.button>
    </motion.div>
  );
}
