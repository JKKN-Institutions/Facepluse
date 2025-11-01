'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { EmojiOption, FlowState } from '@/hooks/useEmojiReactionFlow';
import { Sparkles } from 'lucide-react';

interface EmojiDisplayProps {
  emoji: EmojiOption | null;
  flowState: FlowState;
  matchProgress: number;
}

export default function EmojiDisplay({
  emoji,
  flowState,
  matchProgress,
}: EmojiDisplayProps) {
  if (!emoji) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-white rounded-3xl border-2 border-emerald-200 shadow-xl">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎭</div>
          <p className="text-2xl font-semibold text-emerald-800">
            Get Ready!
          </p>
          <p className="text-gray-600">Prepare to match the emojis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gradient-to-br from-emerald-50 to-white rounded-3xl border-2 border-emerald-200 shadow-xl overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#10B981_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8">
        {/* State indicator */}
        <AnimatePresence mode="wait">
          {flowState === 'matching' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full font-semibold shadow-lg"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>Hold that expression!</span>
            </motion.div>
          )}

          {flowState === 'capturing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold shadow-lg"
            >
              📸 Capturing...
            </motion.div>
          )}

          {flowState === 'captured' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold shadow-lg"
            >
              ✅ Perfect!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={emoji.emoji}
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="text-center space-y-8"
          >
            {/* Large emoji */}
            <motion.div
              animate={{
                scale: flowState === 'matching' ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: flowState === 'matching' ? Infinity : 0,
              }}
              className="text-[200px] md:text-[280px] leading-none"
              style={{
                filter:
                  flowState === 'captured'
                    ? 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.5))'
                    : 'none',
              }}
            >
              {emoji.emoji}
            </motion.div>

            {/* Emotion label */}
            <div className="space-y-2">
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-emerald-800"
                animate={{
                  scale: flowState === 'matching' ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: flowState === 'matching' ? Infinity : 0,
                }}
              >
                {emoji.label}
              </motion.h2>
              <p className="text-xl text-gray-600">
                Make this expression!
              </p>
            </div>

            {/* Match progress bar */}
            {(flowState === 'matching' || flowState === 'capturing') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mx-auto space-y-2"
              >
                <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${matchProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="text-sm text-center text-emerald-600 font-medium">
                  {Math.round(matchProgress)}% matched
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Instruction hint */}
        {flowState === 'showing' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 text-center text-gray-500 text-sm max-w-md px-4"
          >
            Face the camera and match your expression to the emoji above.
            <br />
            Hold it for 1 second to capture!
          </motion.p>
        )}
      </div>

      {/* Flash effect for capture */}
      <AnimatePresence>
        {flowState === 'capturing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
