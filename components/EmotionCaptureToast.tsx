'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle } from 'lucide-react';

interface EmotionCaptureToastProps {
  isVisible: boolean;
  emotion: string;
  smilePercentage: number;
}

export function EmotionCaptureToast({
  isVisible,
  emotion,
  smilePercentage,
}: EmotionCaptureToastProps) {
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-20 right-4 md:top-24 md:right-6 z-40"
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-emerald-300/60 overflow-hidden min-w-[280px]">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm">Emotion Captured!</span>
            </div>

            {/* Content */}
            <div className="p-4 flex items-center gap-3">
              {/* Emoji with glow */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
                className="text-4xl"
              >
                {getEmoji(emotion)}
              </motion.div>

              {/* Details */}
              <div className="flex-1">
                <div className="font-bold text-gray-800 capitalize text-sm">
                  {emotion}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${smilePercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    />
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {smilePercentage}%
                  </span>
                </div>
              </div>

              {/* Camera icon */}
              <Camera className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
