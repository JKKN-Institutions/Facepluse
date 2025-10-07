'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Smile, Heart, Eye, TrendingUp, Clock, Camera } from 'lucide-react';
import { Metric } from '@/lib/supabase/client';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface FirstCapturePopupProps {
  isOpen: boolean;
  onClose: () => void;
  capturedImage: string | null;
  metric: Metric | null;
  sessionDuration: number;
  onRecapture: () => void;
}

export function FirstCapturePopup({
  isOpen,
  onClose,
  capturedImage,
  metric,
  sessionDuration,
  onRecapture,
}: FirstCapturePopupProps) {
  useEffect(() => {
    if (isOpen && metric && metric.smile_percentage >= 80) {
      // Trigger confetti for high scores
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B'],
      });
    }
  }, [isOpen, metric]);

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

  if (!metric) return null;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-2xl border-4 border-white overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-4 pb-6 relative">
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
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                    }}
                    className="mb-3 flex justify-center"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-3 border-white shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                        {capturedImage ? (
                          <img
                            src={capturedImage}
                            alt="Your captured face"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            {getEmoji(metric.emotion)}
                          </div>
                        )}
                      </div>
                      {/* Camera icon badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                      >
                        <Camera className="w-4 h-4 text-emerald-600" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-1"
                  >
                    First Impression! 📸
                  </motion.h2>
                  <p className="text-emerald-100 text-xs">Face captured successfully</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Smile Score */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-3 shadow-lg border border-emerald-100"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Smile className="w-4 h-4 text-emerald-600" />
                      <span className="text-[10px] text-gray-600 font-semibold uppercase">
                        Smile
                      </span>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {metric.smile_percentage}%
                    </div>
                    <div className="mt-1.5 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.smile_percentage}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      />
                    </div>
                  </motion.div>

                  {/* Emotion */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 shadow-lg border border-emerald-200"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Heart className="w-4 h-4 text-emerald-600" />
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
                        {getEmoji(metric.emotion)}
                      </motion.div>
                      <div className="text-xs font-bold text-gray-800 capitalize">
                        {metric.emotion}
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
                    value={metric.blink_count.toString()}
                    color="purple"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Age"
                    value={`${metric.age_estimate}`}
                    color="orange"
                  />
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl p-3 text-center border border-emerald-200"
                >
                  <p className="text-emerald-800 font-semibold text-sm">
                    {metric.smile_percentage >= 80
                      ? '🌟 Amazing first impression!'
                      : metric.smile_percentage >= 60
                      ? '😊 Great energy captured!'
                      : metric.smile_percentage >= 40
                      ? '🙂 Nice capture!'
                      : '💚 Thanks for visiting!'}
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onRecapture}
                    className="bg-white border-2 border-emerald-500 text-emerald-700 font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    Capture Again
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Continue
                  </motion.button>
                </div>
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
  color,
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
      <div
        className={`w-6 h-6 mx-auto mb-1 bg-gradient-to-br ${colorMap[color]} rounded-md flex items-center justify-center`}
      >
        <Icon className="w-3 h-3 text-white" />
      </div>
      <div className="text-[9px] text-gray-500 font-medium mb-0.5">{label}</div>
      <div className="text-sm font-bold text-gray-800">{value}</div>
    </div>
  );
}
