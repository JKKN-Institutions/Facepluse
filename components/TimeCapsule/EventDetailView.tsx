'use client';

import { motion } from 'framer-motion';
import { TimeCapsule } from '@/types/timeCapsule';
import { ArrowLeft, Download, Film, Sparkles, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { emotionEmojis } from '@/lib/emotion-themes';
import { downloadCollage } from '@/lib/collageGenerator';
import { useState } from 'react';
import { toast } from 'sonner';

interface EventDetailViewProps {
  event: TimeCapsule;
  onBack: () => void;
  onGenerateCollage: (eventId: string) => Promise<string | null>;
  isGenerating: boolean;
}

export function EventDetailView({
  event,
  onBack,
  onGenerateCollage,
  isGenerating,
}: EventDetailViewProps) {
  const [localGenerating, setLocalGenerating] = useState(false);

  const handleGenerateCollage = async () => {
    setLocalGenerating(true);
    toast.loading('Creating your emotional collage...', { id: 'collage-gen' });

    try {
      const collageUrl = await onGenerateCollage(event.id);

      if (collageUrl) {
        toast.success('Collage created successfully!', { id: 'collage-gen' });
      }
    } catch {
      toast.error('Failed to generate collage', { id: 'collage-gen' });
    } finally {
      setLocalGenerating(false);
    }
  };

  const handleDownloadCollage = () => {
    if (event.collageUrl) {
      downloadCollage(event.collageUrl, event.eventName);
      toast.success('Collage downloaded!');
    }
  };

  const durationMinutes = Math.floor(event.statistics.duration / 60);
  const durationSeconds = event.statistics.duration % 60;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-3 glass-premium rounded-xl hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">{event.eventName}</h1>
            {event.eventDescription && (
              <p className="text-gray-600 mt-1">{event.eventDescription}</p>
            )}
          </div>
        </motion.div>

        {/* Collage Preview */}
        {event.collageUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-premium rounded-2xl p-6 shadow-xl"
          >
            <div className="bg-emerald-50 rounded-xl overflow-hidden mb-4">
              <img
                src={event.collageUrl}
                alt={`${event.eventName} collage`}
                className="w-full h-auto"
              />
            </div>

            {/* Collage Info */}
            <div className="text-sm text-gray-600 mb-3 text-center">
              📐 Collage contains {event.statistics.totalMoments} moments • Optimized for Full HD viewing
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadCollage}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Collage
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-premium rounded-2xl p-12 text-center"
          >
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
            <h3 className="text-2xl font-bold mb-2">Create Your Collage</h3>
            <p className="text-gray-600 mb-6">
              Generate a beautiful PNG collage from all your captured emotional moments
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateCollage}
              disabled={localGenerating || isGenerating}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {localGenerating || isGenerating ? 'Generating...' : 'Generate Collage'}
            </motion.button>
          </motion.div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Moments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-premium rounded-2xl p-6 text-center"
          >
            <Film className="w-8 h-8 mx-auto mb-3 text-purple-500" />
            <p className="text-4xl font-bold text-gray-800 mb-1">
              {event.statistics.totalMoments}
            </p>
            <p className="text-sm text-gray-600">Moments Captured</p>
          </motion.div>

          {/* Average Happiness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-premium rounded-2xl p-6 text-center"
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-500" />
            <p className="text-4xl font-bold text-green-600 mb-1">
              {event.statistics.averageSmile}%
            </p>
            <p className="text-sm text-gray-600">Average Happiness</p>
          </motion.div>

          {/* Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-premium rounded-2xl p-6 text-center"
          >
            <div className="text-5xl mb-3">⏱️</div>
            <p className="text-4xl font-bold text-gray-800 mb-1">
              {durationMinutes}:{durationSeconds.toString().padStart(2, '0')}
            </p>
            <p className="text-sm text-gray-600">Duration</p>
          </motion.div>
        </div>

        {/* Emotion Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-premium rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">Emotion Journey</h3>

          <div className="space-y-4">
            {Object.entries(event.statistics.emotionDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([emotion, count], index) => {
                const emotionKey = emotion as keyof typeof emotionEmojis;
                const percentage = Math.round((count / event.statistics.totalMoments) * 100);

                return (
                  <motion.div
                    key={emotion}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-3 text-lg capitalize font-semibold">
                        <span className="text-3xl">{emotionEmojis[emotionKey]}</span>
                        {emotion}
                      </span>
                      <span className="text-lg font-bold text-gray-700">
                        {count} moments ({percentage}%)
                      </span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>

        {/* Peak Happiness Moment */}
        {event.statistics.peakHappiness && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-premium rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              Peak Happiness Moment
            </h3>

            <div className="flex items-center gap-6">
              {event.statistics.peakHappiness.imageData && (
                <img
                  src={event.statistics.peakHappiness.imageData}
                  alt="Peak happiness"
                  className="w-32 h-32 rounded-xl object-cover"
                />
              )}

              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Smile Score</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(event.statistics.peakHappiness.smilePercentage)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Emotion</p>
                    <p className="text-3xl">
                      {emotionEmojis[event.statistics.peakHappiness.emotion]}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {new Date(event.statistics.peakHappiness.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
