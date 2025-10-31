'use client';

import { motion } from 'framer-motion';
import { Camera } from '@/components/Camera';
import { TimeCapsuleStatistics } from '@/types/timeCapsule';
import { Square, Film, Smile, Clock } from 'lucide-react';
import { emotionEmojis, Emotion } from '@/lib/emotion-themes';
import { RefObject, useEffect, useState } from 'react';

interface FaceAnalysis {
  face_detected: boolean;
  emotion: string;
  emotion_confidence: number;
  smile_percentage: number;
}

interface FaceDetection {
  box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface RecordingViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  loading: boolean;
  error: string | null;
  analysis: FaceAnalysis | null;
  analyzing: boolean;
  faceDetection: FaceDetection | null;
  statistics: TimeCapsuleStatistics;
  momentCount: number;
  onStopRecording: () => void;
  eventName: string;
}

export function RecordingView({
  videoRef,
  loading,
  error,
  analysis,
  analyzing,
  faceDetection,
  statistics,
  momentCount,
  onStopRecording,
  eventName,
}: RecordingViewProps) {
  const [duration, setDuration] = useState(0);

  // Update duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Recording Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Recording Indicator */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                <span className="text-red-500 font-bold">RECORDING</span>
              </motion.div>

              <div className="h-6 w-px bg-gray-300" />

              {/* Event Name */}
              <div>
                <h2 className="text-xl font-bold text-gray-800">{eventName}</h2>
                <p className="text-sm text-gray-600">Capturing emotional moments...</p>
              </div>
            </div>

            {/* Stop Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStopRecording}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
            >
              <Square className="w-4 h-4" />
              Stop Recording
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Camera
                videoRef={videoRef}
                loading={loading}
                error={error}
                analysis={analysis}
                analyzing={analyzing}
                faceDetection={faceDetection}
              />
            </motion.div>
          </div>

          {/* Live Statistics */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Duration & Moments Counter */}
              <div className="glass-premium rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-5 h-5 text-purple-500" />
                  <h3 className="font-bold text-gray-800">Session Stats</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/50 rounded-xl">
                    <Clock className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <p className="text-3xl font-bold text-gray-800">{formatDuration(duration)}</p>
                    <p className="text-xs text-gray-600">Duration</p>
                  </div>

                  <div className="text-center p-4 bg-white/50 rounded-xl">
                    <Film className="w-5 h-5 mx-auto mb-2 text-green-500" />
                    <motion.p
                      key={momentCount}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-gray-800"
                    >
                      {momentCount}
                    </motion.p>
                    <p className="text-xs text-gray-600">Moments</p>
                  </div>
                </div>
              </div>

              {/* Current Emotion */}
              {analysis?.face_detected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-premium rounded-2xl p-6 text-center"
                >
                  <p className="text-sm text-gray-600 mb-3">Current Emotion</p>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-7xl block mb-3"
                  >
                    {emotionEmojis[analysis.emotion as Emotion]}
                  </motion.span>
                  <p className="text-2xl font-bold capitalize text-gray-800">
                    {analysis.emotion}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Smile className="w-4 h-4 text-green-500" />
                    <span className="text-lg font-semibold text-green-600">
                      {Math.round(analysis.smile_percentage)}%
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Emotion Distribution */}
              <div className="glass-premium rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">Emotion Breakdown</h3>

                {statistics.totalMoments === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No moments captured yet...
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(statistics.emotionDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .map(([emotion, count]) => {
                        const percentage = Math.round((count / statistics.totalMoments) * 100);

                        return (
                          <div key={emotion}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="flex items-center gap-2 capitalize">
                                <span className="text-xl">{emotionEmojis[emotion as Emotion]}</span>
                                {emotion}
                              </span>
                              <span className="font-semibold">{count} ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Average Happiness */}
              {statistics.totalMoments > 0 && (
                <div className="glass-premium rounded-2xl p-6 text-center">
                  <Smile className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-4xl font-bold text-gray-800 mb-1">
                    {statistics.averageSmile}%
                  </p>
                  <p className="text-sm text-gray-600">Average Happiness</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
