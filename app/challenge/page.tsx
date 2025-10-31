'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Camera } from '@/components/Camera';
import { EmojiChallenge } from '@/components/EmojiChallenge';
import { useCamera } from '@/hooks/useCamera';
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis';
import { PageHeader } from '@/components/shared/PageHeader';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChallengePage() {
  const { videoRef, loading, error } = useCamera();
  const { analysis, analyzing } = useFaceAnalysis(videoRef);

  // Show loading state while camera initializes
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Initializing camera...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <PageHeader
            title="Emoji Match Challenge"
            description="Test your acting skills! Match random emotions as fast as you can."
            icon={Target}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera Feed - Left side (2 columns on large screens) */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Camera
                  videoRef={videoRef}
                  loading={loading}
                  error={error}
                  analysis={analysis}
                  analyzing={analyzing}
                  faceDetection={null}
                />
              </motion.div>

              {/* Camera Instructions */}
              {!analysis?.face_detected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-blue-100 border-2 border-blue-300 rounded-xl text-center"
                >
                  <p className="text-blue-800 font-semibold">
                    📷 Please position your face in the camera frame to begin
                  </p>
                </motion.div>
              )}
            </div>

            {/* Challenge Panel - Right side */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {analysis?.face_detected ? (
                  <EmojiChallenge
                    currentEmotion={analysis.emotion as any}
                    emotionConfidence={analysis.emotion_confidence}
                  />
                ) : (
                  <div className="glass-premium rounded-2xl p-8 text-center">
                    <span className="text-6xl block mb-4">🎭</span>
                    <h3 className="text-xl font-bold mb-2">Ready to Play?</h3>
                    <p className="text-gray-600">
                      Show your face to the camera to start the challenge
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* How to Play Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-subtle rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-4 text-gray-800">How to Play:</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-semibold">Start Game</p>
                  <p>Click "Start Challenge" to begin</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-semibold">Match Emotion</p>
                  <p>Mimic the emoji shown on screen</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-semibold">Submit</p>
                  <p>Click submit when you're ready</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <div>
                  <p className="font-semibold">Earn Points</p>
                  <p>Higher accuracy = more points!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
