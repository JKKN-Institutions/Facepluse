'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Share2, Loader2, AlertCircle, Home } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ReactionData {
  id: string;
  frame_url: string;
  reactions: Array<{
    emoji: string;
    emotion: string;
    timestamp: number;
  }>;
  created_at: string;
}

export default function SharedReactionPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<ReactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchReaction();
    }
  }, [id]);

  const fetchReaction = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share-reaction?id=${id}`);

      if (!response.ok) {
        throw new Error('Reaction not found');
      }

      const reactionData = await response.json();
      setData(reactionData);
    } catch (err) {
      console.error('Failed to fetch reaction:', err);
      setError('Failed to load emoji reactions. This link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!data?.frame_url) return;

    try {
      const link = document.createElement('a');
      link.href = data.frame_url;
      link.download = `emoji-reaction-${id}.png`;
      link.target = '_blank';
      link.click();
      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download frame');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emoji Reaction Challenge',
          text: 'Check out these emoji reactions!',
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-16 h-16 text-emerald-500 mx-auto" />
          </motion.div>
          <p className="text-lg font-semibold text-emerald-800">
            Loading emoji reactions...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">
                Oops! Not Found
              </h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold mx-auto hover:bg-emerald-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                Go Home
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const createdDate = new Date(data.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-800">
            🎭 Emoji Reaction Challenge
          </h1>
          <p className="text-gray-600">
            Created on {createdDate}
          </p>
        </motion.div>

        {/* Frame Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-emerald-200">
            <img
              src={data.frame_url}
              alt="Emoji reactions"
              className="w-full h-auto"
            />
          </div>

          {/* Decorative corner elements */}
          <div className="absolute -top-3 -left-3 w-24 h-24 bg-emerald-500 rounded-full blur-2xl opacity-20" />
          <div className="absolute -bottom-3 -right-3 w-32 h-32 bg-green-500 rounded-full blur-2xl opacity-20" />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Download Frame
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Share2 className="w-5 h-5" />
            Share
          </motion.button>

          <Link href="/challenge">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Try It Yourself
            </motion.button>
          </Link>
        </motion.div>

        {/* Reaction Details */}
        {data.reactions && data.reactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-bold text-emerald-800 mb-6 text-center">
              Captured Reactions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.reactions.map((reaction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center p-6 bg-gradient-to-br from-emerald-50 to-white rounded-xl border-2 border-emerald-100"
                >
                  <div className="text-6xl mb-3">{reaction.emoji}</div>
                  <p className="text-lg font-semibold text-emerald-800 capitalize">
                    {reaction.emotion}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Reaction {index + 1}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8"
        >
          <p className="text-gray-500 text-sm">
            Created with{' '}
            <Link
              href="/"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Facepluse
            </Link>
          </p>
          <Link href="/challenge">
            <p className="text-emerald-600 hover:text-emerald-700 font-semibold mt-2 text-sm">
              Try the Emoji Reaction Challenge yourself! →
            </p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
