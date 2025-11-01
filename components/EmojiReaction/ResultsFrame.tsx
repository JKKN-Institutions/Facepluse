'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { CapturedReaction } from '@/lib/emojiReactionFrameGenerator';
import { generateEmojiReactionFrame } from '@/lib/emojiReactionFrameGenerator';
import ShareOptions from './ShareOptions';

interface ResultsFrameProps {
  reactions: CapturedReaction[];
  onRetry?: () => void;
}

export default function ResultsFrame({
  reactions,
  onRetry,
}: ResultsFrameProps) {
  const [frameDataUrl, setFrameDataUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate the frame on mount
  useEffect(() => {
    generateFrame();
  }, [reactions]);

  const generateFrame = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Generate frame without share URL first
      const dataUrl = await generateEmojiReactionFrame({
        reactions,
      });

      setFrameDataUrl(dataUrl);
      setIsGenerating(false);

      // Upload to get share URL
      await uploadFrame(dataUrl);
    } catch (err) {
      console.error('Failed to generate frame:', err);
      setError('Failed to generate your frame. Please try again.');
      setIsGenerating(false);
    }
  };

  const uploadFrame = async (dataUrl: string) => {
    try {
      setIsUploading(true);

      // Upload frame to server
      const response = await fetch('/api/share-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameData: dataUrl,
          reactions: reactions.map((r) => ({
            emoji: r.emoji,
            emotion: r.emotion,
            timestamp: r.timestamp,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload frame');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);

      // Regenerate frame with QR code
      const finalDataUrl = await generateEmojiReactionFrame({
        reactions,
        shareUrl: data.shareUrl,
      });

      setFrameDataUrl(finalDataUrl);
      setIsUploading(false);
    } catch (err) {
      console.error('Failed to upload frame:', err);
      setIsUploading(false);
      // Don't show error, QR code is optional
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-16 h-16 text-emerald-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-emerald-800">
            Creating Your Frame...
          </h3>
          <p className="text-gray-600">
            Putting together your amazing reactions!
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="text-8xl">😕</div>
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-red-600">Oops!</h3>
          <p className="text-gray-600 max-w-md">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-emerald-800"
        >
          🎉 Amazing Work!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600"
        >
          You&apos;ve captured all three emoji reactions perfectly!
        </motion.p>
      </div>

      {/* Frame preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="relative max-w-4xl mx-auto"
      >
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-emerald-200">
          {frameDataUrl && (
            <img
              src={frameDataUrl}
              alt="Your emoji reactions"
              className="w-full h-auto"
            />
          )}

          {/* Uploading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                <span className="text-sm font-medium">
                  Generating QR code...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Decorative corner elements */}
        <div className="absolute -top-3 -left-3 w-24 h-24 bg-emerald-500 rounded-full blur-2xl opacity-20" />
        <div className="absolute -bottom-3 -right-3 w-32 h-32 bg-green-500 rounded-full blur-2xl opacity-20" />
      </motion.div>

      {/* Share options */}
      {frameDataUrl && (
        <ShareOptions
          frameDataUrl={frameDataUrl}
          shareUrl={shareUrl}
          onRetry={onRetry}
        />
      )}

      {/* Individual reactions preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
      >
        {reactions.map((reaction, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-emerald-100"
          >
            <div className="aspect-square relative">
              <img
                src={reaction.image}
                alt={`${reaction.emotion} reaction`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{reaction.emoji}</span>
                  <span className="text-white font-semibold capitalize">
                    {reaction.emotion}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
