'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Smile, Clock, Eye, Activity } from 'lucide-react';
import { Metric, supabase } from '@/lib/supabase/client';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';

interface SessionSummary {
  avgSmile: number;
  totalMetrics: number;
  mostCommonEmotion: string;
  totalBlinks: number;
}

interface ExitSummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  lastMetric: Metric | null;
  sessionDuration?: number; // in seconds
  lastFaceImage?: string | null;
  sessionId?: string | null;
  blinkCount?: number;
}

export function ExitSummaryPopup({
  isOpen,
  onClose,
  lastMetric,
  sessionDuration = 0,
  lastFaceImage,
  sessionId,
  blinkCount = 0
}: ExitSummaryPopupProps) {
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  // Fetch real-time session summary
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    const fetchSessionSummary = async () => {
      try {
        // Fetch all metrics for this session
        const { data: metricsData } = await supabase
          .from('metrics')
          .select('smile_percentage, emotion, blink_count')
          .eq('session_id', sessionId);

        if (metricsData && metricsData.length > 0) {
          // Calculate average smile
          const avgSmile = Math.round(
            metricsData.reduce((sum, m) => sum + (m.smile_percentage || 0), 0) / metricsData.length
          );

          // Find most common emotion
          const emotionCounts: Record<string, number> = {};
          metricsData.forEach(m => {
            const emotion = m.emotion || 'neutral';
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          });
          const mostCommonEmotion = Object.entries(emotionCounts).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0];

          // Get max blink count
          const totalBlinks = Math.max(...metricsData.map(m => m.blink_count || 0));

          setSessionSummary({
            avgSmile,
            totalMetrics: metricsData.length,
            mostCommonEmotion,
            totalBlinks,
          });
        }
      } catch (error) {
        console.error('Error fetching session summary:', error);
      }
    };

    fetchSessionSummary();
  }, [isOpen, sessionId]);

  useEffect(() => {
    if (isOpen && sessionSummary && sessionSummary.avgSmile >= 80) {
      // Trigger confetti for high scores
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7'],
      });
    }
  }, [isOpen, sessionSummary]);

  const getEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      surprised: '😲',
      neutral: '😐',
      angry: '😠',
    };
    return emojiMap[emotion?.toLowerCase()] || '😐';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Use session summary if available, otherwise fall back to real-time data
  const displayData = sessionSummary || {
    avgSmile: lastMetric?.smile_percentage || 0,
    mostCommonEmotion: lastMetric?.emotion || 'neutral',
    totalBlinks: blinkCount, // Use real-time blink count from props
    totalMetrics: 0,
  };

  if (!lastMetric && !sessionSummary) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-2xl border-4 border-white overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-4 pb-6 relative">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                <div className="text-center text-white">
                  {/* Circular Profile Picture */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                    className="mb-3 flex justify-center"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-3 border-white shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                        {lastFaceImage ? (
                          <img
                            src={lastFaceImage}
                            alt="Your face"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            {getEmoji(displayData.mostCommonEmotion)}
                          </div>
                        )}
                      </div>
                      {/* Decorative ring */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-full border-3 border-white/30"
                      />
                    </div>
                  </motion.div>

                  <h2 className="text-2xl font-bold mb-1">Session Summary</h2>
                  <p className="text-green-100 text-xs">See you later! 👋</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Average Smile Score */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-3 shadow-lg border border-green-100"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Smile className="w-4 h-4 text-green-600" />
                      <span className="text-[10px] text-gray-600 font-semibold uppercase">
                        Avg Smile
                      </span>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {displayData.avgSmile}%
                    </div>
                    <div className="mt-1.5 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${displayData.avgSmile}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                      />
                    </div>
                  </motion.div>

                  {/* Emotion */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 shadow-lg border border-green-200"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Heart className="w-4 h-4 text-green-600" />
                      <span className="text-[10px] text-gray-600 font-semibold uppercase">
                        Emotion
                      </span>
                    </div>
                    <div className="text-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                        className="text-4xl mb-0.5"
                      >
                        {getEmoji(displayData.mostCommonEmotion)}
                      </motion.div>
                      <div className="text-xs font-bold text-gray-800 capitalize">
                        {displayData.mostCommonEmotion}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Additional Stats - 3 columns */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-3 gap-2"
                >
                  <StatCard
                    icon={Clock}
                    label="Duration"
                    value={formatDuration(sessionDuration)}
                    color="blue"
                  />
                  <StatCard
                    icon={Eye}
                    label="Blinks"
                    value={displayData.totalBlinks.toString()}
                    color="purple"
                  />
                  <StatCard
                    icon={Activity}
                    label="Captures"
                    value={displayData.totalMetrics.toString()}
                    color="orange"
                  />
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 text-center border border-green-200"
                >
                  <p className="text-green-800 font-semibold text-sm">
                    {displayData.avgSmile >= 80
                      ? "🌟 Amazing session! You were glowing!"
                      : displayData.avgSmile >= 60
                      ? "😊 Great vibes! Keep smiling!"
                      : displayData.avgSmile >= 40
                      ? "🙂 Nice session! Come back soon!"
                      : "💚 Thanks for visiting! Have a great day!"}
                  </p>
                </motion.div>

                {/* Action Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  Continue Session
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
  };

  return (
    <div className="bg-white rounded-lg p-2 shadow-md border border-gray-100 text-center">
      <div className={`w-6 h-6 mx-auto mb-1 bg-gradient-to-br ${colorMap[color]} rounded-md flex items-center justify-center`}>
        <Icon className="w-3 h-3 text-white" />
      </div>
      <div className="text-[9px] text-gray-500 font-medium mb-0.5">{label}</div>
      <div className="text-sm font-bold text-gray-800">{value}</div>
    </div>
  );
}
