'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { EmojiOption } from '@/hooks/useEmojiReactionFlow';

interface CaptureProgressProps {
  currentStep: number;
  totalSteps: number;
  selectedEmojis: EmojiOption[];
  capturedCount: number;
}

export default function CaptureProgress({
  currentStep,
  totalSteps,
  selectedEmojis,
  capturedCount,
}: CaptureProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < capturedCount;
          const isCurrent = index === currentStep;
          const emoji = selectedEmojis[index];

          return (
            <div key={index} className="flex items-center gap-2">
              {/* Step circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative w-16 h-16 rounded-full flex items-center justify-center text-2xl
                  transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                      : isCurrent
                        ? 'bg-white border-4 border-emerald-500 shadow-lg'
                        : 'bg-gray-200 border-2 border-gray-300'
                  }
                `}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </motion.div>
                ) : emoji ? (
                  <span className={isCurrent ? 'animate-bounce' : ''}>
                    {emoji.emoji}
                  </span>
                ) : (
                  <span className="text-gray-400">?</span>
                )}

                {/* Current step pulse ring */}
                {isCurrent && !isCompleted && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-emerald-500"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div className="relative w-12 h-1">
                  <div className="absolute inset-0 bg-gray-300 rounded-full" />
                  <motion.div
                    className="absolute inset-0 bg-emerald-500 rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: isCompleted ? 1 : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Text indicator */}
      <div className="text-center">
        <p className="text-lg font-semibold text-emerald-800">
          Step {currentStep + 1} of {totalSteps}
        </p>
        <p className="text-sm text-gray-600">
          {capturedCount === 0
            ? 'No captures yet'
            : capturedCount === totalSteps
              ? 'All reactions captured! 🎉'
              : `${capturedCount} captured, ${totalSteps - capturedCount} remaining`}
        </p>
      </div>

      {/* Emoji labels */}
      <div className="flex justify-center gap-4 mt-6">
        {selectedEmojis.map((emoji, index) => {
          const isCompleted = index < capturedCount;
          const isCurrent = index === currentStep;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-300
                ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-700'
                    : isCurrent
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-500'
                }
              `}
            >
              {emoji.label}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
