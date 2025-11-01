'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Copy, Check, RefreshCw, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { downloadFrame } from '@/lib/emojiReactionFrameGenerator';
import QRCode from 'qrcode';

interface ShareOptionsProps {
  frameDataUrl: string;
  shareUrl: string | null;
  onRetry?: () => void;
}

export default function ShareOptions({
  frameDataUrl,
  shareUrl,
  onRetry,
}: ShareOptionsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const handleDownload = () => {
    try {
      downloadFrame(frameDataUrl);
      toast.success('Frame downloaded successfully!', {
        description: 'Check your downloads folder',
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download frame');
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      toast.error('Share link not available yet');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');

      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (!shareUrl) {
      toast.error('Share link not available yet');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Emoji Reactions',
          text: 'Check out my emoji reaction challenge results!',
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  const handleShowQR = async () => {
    if (!shareUrl) {
      toast.error('Share link not available yet');
      return;
    }

    if (!qrDataUrl) {
      try {
        const dataUrl = await QRCode.toDataURL(shareUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#059669', // Emerald-600
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('QR generation failed:', error);
        toast.error('Failed to generate QR code');
        return;
      }
    }

    setShowQR(!showQR);
  };

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        {/* Download button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Download className="w-5 h-5" />
          Download Frame
        </motion.button>

        {/* Share button */}
        {shareUrl && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Share2 className="w-5 h-5" />
            Share
          </motion.button>
        )}

        {/* Copy link button */}
        {shareUrl && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyLink}
            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isCopied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Link
              </>
            )}
          </motion.button>
        )}

        {/* QR code button */}
        {shareUrl && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowQR}
            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-500 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <QrCode className="w-5 h-5" />
            {showQR ? 'Hide' : 'Show'} QR
          </motion.button>
        )}

        {/* Retry button */}
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="flex items-center gap-3 px-8 py-4 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </motion.button>
        )}
      </motion.div>

      {/* QR code modal */}
      {showQR && qrDataUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-2xl border-2 border-emerald-200 max-w-md mx-auto"
        >
          <h3 className="text-xl font-bold text-emerald-800">
            Scan to View & Share
          </h3>
          <div className="p-4 bg-white rounded-xl shadow-lg">
            <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Scan this QR code with your phone to view and share your reactions
          </p>
          {shareUrl && (
            <div className="w-full p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center break-all">
                {shareUrl}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Share link info */}
      {!shareUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            💡 Your frame will be available for download. Share link will be
            generated shortly!
          </p>
        </motion.div>
      )}
    </div>
  );
}
